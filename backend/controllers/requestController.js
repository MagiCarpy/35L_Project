import asyncHandler from "express-async-handler";
import { Request } from "../models/request.model.js";

const RequestController = {
  // make new req
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

    res.status(201).json({
      message: "Request created",
      request: newReq,
    });
  }),

  // get open reqs
  list: asyncHandler(async (req, res) => {
    const requests = await Request.findAll();
    res.status(200).json({ requests });
  }),

  // get a single req via ID
  getOne: asyncHandler(async (req, res) => {
    const id = req.params.id;
    const reqData = await Request.findOne({ where: { id } });

    if (!reqData)
      return res.status(404).json({ message: "Request not found" });

    res.status(200).json({ request: reqData });
  }),

  // accept a request
  accept: asyncHandler(async (req, res) => {
    if (!req.session.userId)
      return res.status(401).json({ message: "Not authenticated" });

    const id = req.params.id;
    const helperId = req.session.userId;

    // NEW: prevent multiple active deliveries
    const activeDelivery = await Request.findOne({
      where: {
        helperId,
        status: "accepted",
      },
    });

    if (activeDelivery) {
      return res.status(400).json({
        message: "You already have an active delivery.",
        activeRequestId: activeDelivery.id,
      });
    }

    const reqData = await Request.findOne({ where: { id } });

    if (!reqData)
      return res.status(404).json({ message: "Request not found" });

    if (reqData.status !== "open")
      return res.status(400).json({ message: "Request already accepted or closed" });

    reqData.helperId = helperId;
    reqData.status = "accepted";
    await reqData.save();

    res.status(200).json({
      message: "Request accepted",
      request: reqData,
    });
  }),

  // upload delivery confirmation photo
  uploadPhoto: asyncHandler(async (req, res) => {
    if (!req.session.userId)
      return res.status(401).json({ message: "Not authenticated" });

    const id = req.params.id;
    const reqData = await Request.findOne({ where: { id } });

    if (!reqData) {
      return res.status(404).json({ message: "Request not found" });
    }

    // Only helper assigned to this request can upload
    if (reqData.helperId !== req.session.userId) {
      return res.status(403).json({ message: "Not your delivery." });
    }

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded." });
    }

    // Save path into database
    reqData.deliveryPhotoUrl = `/uploads/delivery/${req.file.filename}`;
    await reqData.save();

    res.status(200).json({
      message: "Photo uploaded successfully",
      url: reqData.deliveryPhotoUrl,
    });
  }),
  
  completeDelivery: asyncHandler(async (req, res) => {
    const requestId = req.params.id;

    const reqData = await Request.findByPk(requestId);

    if (!reqData)
      return res.status(404).json({ message: "Request not found" });

    if (reqData.helperId !== req.session.userId)
      return res.status(403).json({ message: "Not your delivery." });

    if (!reqData.deliveryPhotoUrl)
      return res.status(400).json({ message: "Photo required before completing delivery." });

    reqData.status = "delivered";
    await reqData.save();

    res.json({ message: "Delivery marked as delivered", request: reqData });
  }),

  delete: asyncHandler(async (req, res) => {
    const id = req.params.id;

    const reqData = await Request.findOne({ where: { id } });
    if (!reqData)
        return res.status(404).json({ message: "Request not found" });

    // Optional: protect so only the owner can delete
    if (reqData.userId !== req.session.userId) {
        return res.status(403).json({ message: "Not allowed" });
    }

    await reqData.destroy();
    res.status(200).json({ message: "Request deleted" });
    }),
    
  myAssignments: asyncHandler(async (req, res) => {
    if (!req.session.userId)
        return res.status(401).json({ message: "Not authenticated" });
    const helperId = req.session.userId;
    const assignments = await Request.findAll({
            where: { helperId, status: "accepted" }
    });
    res.status(200).json({ assignments });
    }),

};

export default RequestController;
