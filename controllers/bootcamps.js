const Bootcamp = require('../models/Bootcamp');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const geocoder = require('../utils/geocoder');

//@desc Gel all bootcamps
//@route GET /api/v1/bootcamps
//@access Public

exports.getBootcamps = asyncHandler(async (req, res, next) => {
  let query;
  console.log('req.query>>', req.query);

  // Copy req.query
  const reqQuery = { ...req.query };

  // Field to exclude
  const removeFields = ['select', 'sort'];

  // Loop over removeFields and delete from reqQuery
  removeFields.forEach(param => delete reqQuery[param]);

  console.log('reqQuery>', reqQuery);

  // Create query String
  let queryStr = JSON.stringify(reqQuery);
  console.log('queryStr before>>', queryStr);

  // Create operators ($gt, $gte, etc)
  queryStr = queryStr.replace(/\b(gt|gte|lt|lte)\b/g, match => `$${match}`);
  console.log('queryStr after>>', queryStr);

  // Finding resource
  console.log('parse json>>', JSON.parse(queryStr));
  query = Bootcamp.find(JSON.parse(queryStr));

  // Select Field
  if (req.query.select) {
    console.log('req.query.select>>', req.query.select);
    const fields = req.query.select.split(',').join(' ');
    console.log(fields);
    query = query.select(fields);
  }
  //Sort
  if (req.query.sort) {
    const sortBy = req.query.sort.split(',').join(' ');
    console.log(sortBy);
    query = query.sort(sortBy);
  } else {
    query = query.sort('-createdAt');
  }
  // executing query
  const bootcamps = await query;

  res
    .status(200)
    .json({ success: true, count: bootcamps.length, data: bootcamps });
});
//@desc Get single bootcamps
//@route GET /api/v1/bootcamps/:id
//@access Public

exports.getBootcamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findById(req.params.id);
  if (!bootcamp) {
    return new ErrorResponse(
      `Bootcamp not found with id of ${req.params.id}`, // formatted object id
      404
    );
  }
  res.status(200).json({ success: true, data: bootcamp });
});

//@desc Create a new bootcamps
//@route POST /api/v1/bootcamps
//@access Private

exports.createBootcamp = asyncHandler(async (req, res, next) => {
  console.log(req.body);
  const bootcamp = await Bootcamp.create(req.body);
  res.status(201).json({ sucess: true, data: bootcamp });
});

//@desc Update a bootcamps
//@route PUT /api/v1/bootcamps/:id
//@access Private

exports.updateBootcamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  if (!bootcamp) {
    return new ErrorResponse(
      `Bootcamp not found with id of ${req.params.id}`, // formatted object id
      404
    );
  }
  res.status(200).json({ success: true, data: bootcamp });
});
//@desc Delete a bootcamps
//@route DELETE /api/v1/bootcamps/:id
//@access Private

exports.deleteBootcamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findByIdAndDelete(req.params.id);

  if (!bootcamp) {
    return new ErrorResponse(
      `Bootcamp not found with id of ${req.params.id}`, // formatted object id
      404
    );
  }
  res.status(200).json({ success: true, data: {} });
});

//@desc Get bootcamps within a radius
//@route GET /api/v1/bootcamps/radius/:zipcode/:distance
//@access Private

exports.getBootcampsInRadius = asyncHandler(async (req, res, next) => {
  const { zipcode, distance } = req.params;

  // GET lat/lng from geocoder
  const loc = await geocoder.geocode(zipcode);
  const lat = loc[0].latitude;
  const lng = loc[0].longitude;

  // calc radius using radians
  // Divide dist by radius of Earth
  // Earth Radius = 3963 miles

  const radius = distance / 3963;

  const bootcamp = await Bootcamp.find({
    location: {
      $geoWithin: { $centerSphere: [[lng, lat], radius] }
    }
  });

  res.status(200).json({
    success: true,
    count: bootcamp.length,
    data: bootcamp
  });
});
