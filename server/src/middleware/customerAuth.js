import jwt from "jsonwebtoken";
import Customer from "../models/Customer.js";
import asyncHandler from "../utils/asyncHandler.js";

function readToken(request) {
  const bearer = request.headers.authorization?.startsWith("Bearer ")
    ? request.headers.authorization.slice(7)
    : null;
  return request.cookies?.sj_customer_token || bearer;
}

async function resolveCustomer(request) {
  const token = readToken(request);
  if (!token) return null;
  const payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
  if (payload.role !== "customer") return null;
  return Customer.findOne({ _id: payload.sub, active: true });
}

export const requireCustomer = asyncHandler(async (request, response, next) => {
  let customer;
  try {
    customer = await resolveCustomer(request);
  } catch {
    customer = null;
  }
  if (!customer) return response.status(401).json({ message: "Customer login required." });
  request.customer = customer;
  next();
});
