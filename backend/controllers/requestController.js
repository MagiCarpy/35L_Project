import asyncHandler from "express-async-handler";
import { Request } from "../models/request.model.js";

const RequestController = {
  // CREATE REQUEST
  create: asyncHandler(async (req, res) => {
    const { item, pickupLocation, dropoffLocation, pickupLat, pickupLng, dropoffLat, dropoffLng } = req.body;

    if (!req.session.userId)
      return res.status(401).json({ message: "Not authenticated" });

    if (!item || !pickupLocation || !dropoffLocation)
      return res.status(400).json({ message: "Missing fields" });

    const newReq = await Request.create({
      userId: req.session.userId,
      item,
      pickupLocation,
      dropoffLocation,
      pickupLat,
      pickupLng,
      dropoffLat,
      dropoffLng,
    });

    res.status(201).json({ message: "Request created", request: newReq });
  }),

  // LIST
  list: asyncHandler(async (req, res) => {
    const requests = await Request.findAll();
    res.status(200).json({ requests });
  }),

  // GET ONE
  getOne: asyncHandler(async (req, res) => {
    const id = req.params.id;
    const reqData = await Request.findOne({ where: { id } });

    if (!reqData)
      return res.status(404).json({ message: "Request not found" });

    res.status(200).json({ request: reqData });
  }),

  // ACCEPT
  accept: asyncHandler(async (req, res) => {
    if (!req.session.userId)
      return res.status(401).json({ message: "Not authenticated" });

    const id = req.params.id;
    const helperId = req.session.userId;

    // Prevent multiple active deliveries
    const active = await Request.findOne({
      where: { helperId, status: "accepted" },
    });
    if (active) {
      return res.status(400).json({
        message: "You already have an active delivery.",
        activeRequestId: active.id,
      });
    }

    const reqData = await Request.findByPk(id);
    if (!reqData)
      return res.status(404).json({ message: "Request not found" });

    if (reqData.status !== "open")
      return res.status(400).json({ message: "Already accepted or closed" });

    reqData.helperId = helperId;
    reqData.status = "accepted";
    await reqData.save();

    res.status(200).json({ message: "Request accepted", request: reqData });
  }),

  // UPLOAD PHOTO
  uploadPhoto: asyncHandler(async (req, res) => {
    if (!req.session.userId)
      return res.status(401).json({ message: "Not authenticated" });

    const id = req.params.id;
    const reqData = await Request.findByPk(id);

    if (!reqData)
      return res.status(404).json({ message: "Request not found" });

    if (reqData.helperId !== req.session.userId)
      return res.status(403).json({ message: "Not your delivery." });

    if (!req.file)
      return res.status(400).json({ message: "No file uploaded." });

    reqData.deliveryPhotoUrl = `/uploads/delivery/${req.file.filename}`;
    await reqData.save();

    res.json({ message: "Photo uploaded successfully", url: reqData.deliveryPhotoUrl });
  }),

  // COMPLETE DELIVERY (helper)
  completeDelivery: asyncHandler(async (req, res) => {
    const id = req.params.id;
    const reqData = await Request.findByPk(id);

    if (!reqData)
      return res.status(404).json({ message: "Request not found" });

    if (reqData.helperId !== req.session.userId)
      return res.status(403).json({ message: "Not your delivery." });

    if (!reqData.deliveryPhotoUrl)
      return res.status(400).json({ message: "Upload a delivery photo first." });

    reqData.status = "completed";
    await reqData.save();

    res.json({ message: "Delivery completed", request: reqData });
  }),

  // RECEIVER CONFIRMS RECEIVED
  confirmReceived: asyncHandler(async (req, res) => {
    const id = req.params.id;
    const reqData = await Request.findByPk(id);

    if (!reqData)
      return res.status(404).json({ message: "Request not found" });

    if (reqData.userId !== req.session.userId)
      return res.status(403).json({ message: "Not your request." });

    reqData.receiverConfirmed = "received";
    await reqData.save();

    res.json({ message: "Delivery confirmed as received", request: reqData });
  }),

  // RECEIVER CONFIRMS NOT RECEIVED
  confirmNotReceived: asyncHandler(async (req, res) => {
    const id = req.params.id;
    const reqData = await Request.findByPk(id);

    if (!reqData)
      return res.status(404).json({ message: "Request not found" });

    if (reqData.userId !== req.session.userId)
      return res.status(403).json({ message: "Not your request." });

    reqData.receiverConfirmed = "not_received";
    await reqData.save();

    res.json({ message: "Marked as not received", request: reqData });
  }),

  // DELETE
  delete: asyncHandler(async (req, res) => {
    const id = req.params.id;

    const reqData = await Request.findByPk(id);
    if (!reqData)
      return res.status(404).json({ message: "Request not found" });

    if (reqData.userId !== req.session.userId)
      return res.status(403).json({ message: "Not allowed" });

    await reqData.destroy();
    res.json({ message: "Request deleted" });
  }),
};

export default RequestController;
