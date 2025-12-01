import asyncHandler from "express-async-handler";
import { Request } from "../models/request.model.js";
import { ArchivedRequest } from "../models/archivedRequest.model.js";

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

    if (!req.session.userId)
      return res.status(401).json({ message: "Not authenticated" });

    if (!item || !pickupLocation || !dropoffLocation)
      return res.status(400).json({ message: "Missing fields" });

    if (item.length > 50)
      return res.status(422).json({ message: "Invalid item length" });

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

    if (!reqData) return res.status(404).json({ message: "Request not found" });

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
    if (!reqData) return res.status(404).json({ message: "Request not found" });

    if (reqData.userId === helperId) {
      return res
        .status(400)
        .json({ message: "You can't accept your own request." });
    }

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

    if (!reqData) return res.status(404).json({ message: "Request not found" });

    if (reqData.helperId !== req.session.userId)
      return res.status(403).json({ message: "Not your delivery." });

    if (!req.file)
      return res.status(400).json({ message: "No file uploaded." });

    reqData.deliveryPhotoUrl = `/uploads/delivery/${req.file.filename}`;
    await reqData.save();

    res.json({
      message: "Photo uploaded successfully",
      url: reqData.deliveryPhotoUrl,
    });
  }),

  // COMPLETE DELIVERY (helper)
  completeDelivery: asyncHandler(async (req, res) => {
    const id = req.params.id;
    const reqData = await Request.findByPk(id);

    if (!reqData) return res.status(404).json({ message: "Request not found" });

    if (reqData.helperId !== req.session.userId)
      return res.status(403).json({ message: "Not your delivery." });

    if (!reqData.deliveryPhotoUrl)
      return res
        .status(400)
        .json({ message: "Upload a delivery photo first." });

    reqData.status = "completed";
    await reqData.save();

    res.json({ message: "Delivery completed", request: reqData });
  }),

  // HELPER CANCELS DELIVERY
  cancelDelivery: asyncHandler(async (req, res) => {
    const id = req.params.id;
    const reqData = await Request.findByPk(id);

    if (!reqData)
      return res.status(404).json({ message: "Request not found" });

    if (reqData.helperId !== req.session.userId)
      return res.status(403).json({ message: "You are not the helper for this request." });

    if (reqData.status !== "accepted")
      return res.status(400).json({ message: "Cannot cancel — request is not currently accepted." });

    reqData.status = "open";
    reqData.helperId = null;
    reqData.deliveryPhotoUrl = null;
    reqData.receiverConfirmed = "pending";

    await reqData.save();

    res.json({ message: "Delivery canceled and request reopened", request: reqData });
  }),


  // RECEIVER CONFIRMS RECEIVED
  confirmReceived: asyncHandler(async (req, res) => {
    const id = req.params.id;
    const reqData = await Request.findByPk(id);

    if (!reqData) return res.status(404).json({ message: "Request not found" });

    if (reqData.userId !== req.session.userId)
      return res.status(403).json({ message: "Not your request." });

    await ArchivedRequest.create({
      originalRequestId: reqData.id,
      userId: reqData.userId,
      helperId: reqData.helperId,
      item: reqData.item,
      pickupLocation: reqData.pickupLocation,
      dropoffLocation: reqData.dropoffLocation,
      pickupLat: reqData.pickupLat,
      pickupLng: reqData.pickupLng,
      dropoffLat: reqData.dropoffLat,
      dropoffLng: reqData.dropoffLng,
      status: "completed",
      deliveryPhotoUrl: reqData.deliveryPhotoUrl,
      receiverConfirmed: "received",
      createdAt: reqData.createdAt,
      updatedAt: new Date()
    });

    await reqData.destroy();

    res.json({ message: "Request completed and archived" });
  }),


  // RECEIVER CONFIRMS NOT RECEIVED
  confirmNotReceived: asyncHandler(async (req, res) => {
    const id = req.params.id;
    const reqData = await Request.findByPk(id);

    if (!reqData) return res.status(404).json({ message: "Request not found" });

    if (reqData.userId !== req.session.userId)
      return res.status(403).json({ message: "Not your request." });

    reqData.status = "open";
    reqData.helperId = null;
    reqData.deliveryPhotoUrl = null;
    reqData.receiverConfirmed = "pending";

    await reqData.save();

    res.json({ message: "Request reopened for others to accept", request: reqData });
  }),


  // DELETE
  delete: asyncHandler(async (req, res) => {
    const id = req.params.id;

    const reqData = await Request.findByPk(id);
    if (!reqData) return res.status(404).json({ message: "Request not found" });

    if (reqData.userId !== req.session.userId)
      return res.status(403).json({ message: "Not allowed" });

    await reqData.destroy();
    res.json({ message: "Request deleted" });
  }),

  // GET USER STATS
  getUserStats: asyncHandler(async (req, res) => {
    const userId = req.session.userId;

    const currentAsRequester = await Request.findAll({ where: { userId } });
    const currentAsCourier = await Request.findAll({ where: { helperId: userId } });
    const activeAsRequester = await Request.findAll({
      where: { userId },
      order: [["createdAt", "DESC"]],
    });

    const activeAsCourier = await Request.findAll({
      where: { helperId: userId },
      order: [["createdAt", "DESC"]],
    });

    const archivedAsRequester = await ArchivedRequest.findAll({
      where: { userId },
      order: [["createdAt", "DESC"]],
    });

    const archivedAsCourier = await ArchivedRequest.findAll({
      where: { helperId: userId },
      order: [["createdAt", "DESC"]],
    });

    const completedDeliveries = archivedAsCourier;
    const completedRequests = archivedAsRequester;

    const received = archivedAsRequester.filter(r => r.receiverConfirmed === "received");
    const notReceived = archivedAsRequester.filter(
      r => r.receiverConfirmed === "not_received"
    );

    // Compute simple weekly activity
    const now = new Date();
    const days = [...Array(14)].map((_, i) => {
      const day = new Date(now);
      day.setDate(now.getDate() - (13 - i));
      return day.toISOString().split("T")[0]; // YYYY-MM-DD
    });

    const deliveriesPerDay = days.map(day =>
      completedDeliveries.filter(r => r.updatedAt.toISOString().startsWith(day)).length
    );

    const requestsPerDay = days.map(day =>
      completedRequests.filter(r => r.updatedAt.toISOString().startsWith(day)).length
    );

    res.json({
      asRequester: [...activeAsRequester, ...archivedAsRequester],
      asCourier: [...activeAsCourier, ...archivedAsCourier],

      counts: {
        deliveriesCompleted: completedDeliveries.length,
        requestsActive: activeAsRequester.filter(r => r.status === "pending").length,

        requestsMade: activeAsRequester.length,
        requestsCompleted: completedRequests.length,
        requestsReceived: received.length,
        requestsNotReceived: notReceived.length,
      },
      chart: {
        days,
        deliveriesPerDay,
        requestsPerDay
      },
    });
  }),
};


export default RequestController;
