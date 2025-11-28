import asyncHandler from "express-async-handler";
import { Request } from "../models/request.model.js";

const RequestController = {
  // CREATE REQUEST
  create: asyncHandler(async (req, res) => {
    const {
      item,
      pickupLocation,
      dropoffLocation,
      pickupLat,
      pickupLng,
      dropoffLat,
      dropoffLng,
    } = req.body;

    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    if (!item || !pickupLocation || !dropoffLocation) {
      return res.status(400).json({ message: "Missing fields" });
    }

    const newReq = await Request.create({
      userId: req.session.userId,
      item,
      pickupLocation,
      dropoffLocation,
      pickupLat,
      pickupLng,
      dropoffLat,
      dropoffLng,
      status: "open",
    });

    res.status(201).json({ message: "Request created", request: newReq });
  }),

  // LIST ALL
  list: asyncHandler(async (_req, res) => {
    const requests = await Request.findAll();
    res.status(200).json({ requests });
  }),

  // GET ONE
  getOne: asyncHandler(async (req, res) => {
    const id = req.params.id;
    const reqData = await Request.findByPk(id);

    if (!reqData) {
      return res.status(404).json({ message: "Request not found" });
    }

    res.status(200).json({ request: reqData });
  }),

  // ACCEPT (open -> accepted)
  accept: asyncHandler(async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const id = req.params.id;
    const helperId = req.session.userId;

    // one active delivery at a time (accepted or in_delivery)
    const active = await Request.findOne({
      where: {
        helperId,
        status: ["accepted", "in_delivery"],
      },
    });

    if (active) {
      return res.status(400).json({
        message: "You already have an active delivery.",
        activeRequestId: active.id,
      });
    }

    const reqData = await Request.findByPk(id);
    if (!reqData) {
      return res.status(404).json({ message: "Request not found" });
    }

    // prevent accepting own request
    if (reqData.userId === helperId) {
      return res
        .status(400)
        .json({ message: "You can't accept your own request." });
    }

    if (reqData.status !== "open") {
      return res
        .status(400)
        .json({ message: "This request is not open anymore." });
    }

    reqData.helperId = helperId;
    reqData.status = "accepted";
    await reqData.save();

    res.status(200).json({ message: "Request accepted", request: reqData });
  }),

  // START DELIVERY (accepted -> in_delivery)
  startDelivery: asyncHandler(async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const id = req.params.id;
    const helperId = req.session.userId;

    const reqData = await Request.findByPk(id);
    if (!reqData) {
      return res.status(404).json({ message: "Request not found" });
    }

    if (reqData.helperId !== helperId) {
      return res.status(403).json({ message: "Not your delivery." });
    }

    if (reqData.status !== "accepted") {
      return res
        .status(400)
        .json({ message: "Can only start delivery from accepted state." });
    }

    reqData.status = "in_delivery";
    await reqData.save();

    res.json({ message: "Delivery started", request: reqData });
  }),

  // HELPER CANCEL (accepted/in_delivery -> open)
  cancelByHelper: asyncHandler(async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const id = req.params.id;
    const helperId = req.session.userId;

    const reqData = await Request.findByPk(id);
    if (!reqData) {
      return res.status(404).json({ message: "Request not found" });
    }

    if (reqData.helperId !== helperId) {
      return res.status(403).json({ message: "Not your delivery." });
    }

    if (!["accepted", "in_delivery"].includes(reqData.status)) {
      return res.status(400).json({
        message: "Only accepted or in-delivery requests can be cancelled.",
      });
    }

    reqData.helperId = null;
    reqData.status = "open";
    await reqData.save();

    res.json({ message: "Delivery cancelled, request reopened", request: reqData });
  }),

  // REQUESTER CANCEL (open/accepted -> cancelled_by_requester or delete)
  cancelByRequester: asyncHandler(async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const id = req.params.id;
    const userId = req.session.userId;

    const reqData = await Request.findByPk(id);
    if (!reqData) {
      return res.status(404).json({ message: "Request not found" });
    }

    if (reqData.userId !== userId) {
      return res.status(403).json({ message: "Not your request." });
    }

    // simplest behavior: just delete it for now
    await reqData.destroy();
    res.json({ message: "Request cancelled by requester & deleted." });
  }),

  // UPLOAD PHOTO
  uploadPhoto: asyncHandler(async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const id = req.params.id;
    const reqData = await Request.findByPk(id);

    if (!reqData) {
      return res.status(404).json({ message: "Request not found" });
    }

    if (reqData.helperId !== req.session.userId) {
      return res.status(403).json({ message: "Not your delivery." });
    }

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded." });
    }

    reqData.deliveryPhotoUrl = `/uploads/delivery/${req.file.filename}`;
    await reqData.save();

    res.json({
      message: "Photo uploaded successfully",
      url: reqData.deliveryPhotoUrl,
      request: reqData,
    });
  }),

  // COMPLETE DELIVERY (in_delivery -> completed)
  completeDelivery: asyncHandler(async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const id = req.params.id;
    const reqData = await Request.findByPk(id);

    if (!reqData) {
      return res.status(404).json({ message: "Request not found" });
    }

    if (reqData.helperId !== req.session.userId) {
      return res.status(403).json({ message: "Not your delivery." });
    }

    if (!["accepted", "in_delivery"].includes(reqData.status)) {
      return res.status(400).json({
        message: "Can only complete from accepted or in-delivery state.",
      });
    }

    if (!reqData.deliveryPhotoUrl) {
      return res.status(400).json({ message: "Upload a delivery photo first." });
    }

    reqData.status = "completed";
    await reqData.save();

    res.json({ message: "Delivery completed", request: reqData });
  }),

  // RECEIVER CONFIRMS RECEIVED (completed -> received)
  confirmReceived: asyncHandler(async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const id = req.params.id;
    const reqData = await Request.findByPk(id);

    if (!reqData) {
      return res.status(404).json({ message: "Request not found" });
    }

    if (reqData.userId !== req.session.userId) {
      return res.status(403).json({ message: "Not your request." });
    }

    if (reqData.status !== "completed") {
      return res
        .status(400)
        .json({ message: "Can only confirm a completed delivery." });
    }

    reqData.receiverConfirmed = "received";
    await reqData.destroy();

    res.json({ message: "Delivery confirmed and request deleted." });
  }),

  // RECEIVER CONFIRMS NOT RECEIVED (completed -> not_received)
  confirmNotReceived: asyncHandler(async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const id = req.params.id;
    const reqData = await Request.findByPk(id);

    if (!reqData) {
      return res.status(404).json({ message: "Request not found" });
    }

    if (reqData.userId !== req.session.userId) {
      return res.status(403).json({ message: "Not your request." });
    }

    if (reqData.status !== "completed") {
      return res
        .status(400)
        .json({ message: "Can only mark completed deliveries." });
    }
    reqData.status = "open";
    reqData.helperId = null;
    reqData.receiverConfirmed = "not_received";
    reqData.deliveryPhotoUrl = null; // optional reset
    await reqData.save();

    res.json({ message: "Marked as not received — request reopened", request: reqData });


  }),

  // DELETE (keep for now, used by your UI)
  delete: asyncHandler(async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const id = req.params.id;
    const reqData = await Request.findByPk(id);

    if (!reqData) {
      return res.status(404).json({ message: "Request not found" });
    }

    if (reqData.userId !== req.session.userId) {
      return res.status(403).json({ message: "Not allowed" });
    }

    await reqData.destroy();
    res.json({ message: "Request deleted" });
  }),
};

export default RequestController;
