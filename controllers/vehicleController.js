const Vehicle = require("../models/vehicleModel");

// Create 
exports.createVehicle = async (req, res) => {
  const { vname, passenger, vprice } = req.body;
  const images = req.fileLocations;

  try {
    if (!vname || !passenger || !vprice) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const latestVehicle = await Vehicle.findOne().sort({ createdAt: -1 }).select('vehicleID');
    const newIdNumber = latestVehicle && latestVehicle.vehicleID ? parseInt(latestVehicle.vehicleID.split('-')[1]) + 1 : 1000000000;
    const vehicleID = `VEH-${newIdNumber}`;

    const vehicleEntry = new Vehicle({
      vehicleID,
      vname,
      passenger,
      vprice: JSON.parse(vprice), 
      image: images,
    });

    const newVehicle = await vehicleEntry.save();

    res.status(201).json({
      id: newVehicle._id,
      vehicleID: newVehicle.vehicleID,
      vname: newVehicle.vname,
      passenger: newVehicle.passenger,
      vprice: newVehicle.vprice,
      image: newVehicle.image,
      createdAt: newVehicle.createdAt,
      updatedAt: newVehicle.updatedAt,
    });
  } catch (err) {
    console.error("Error creating vehicle:", err);
    res.status(400).json({ message: err.message });
  }
};

// Update 
exports.updateVehicle = async (req, res) => {
  const { vname, passenger, vprice } = req.body;
  const updateData = { vname, passenger, vprice: JSON.parse(vprice) }; 

  try {
    const existingVehicle = await Vehicle.findById(req.params.id);
    if (!existingVehicle) {
      return res.status(404).json({ message: "Vehicle not found" });
    }


    if (req.fileLocations && req.fileLocations.length > 0) {
      updateData.image = req.fileLocations;
    } else {
      updateData.image = existingVehicle.image;
    }

    const updatedVehicle = await Vehicle.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!updatedVehicle) {
      return res.status(404).json({ message: "Vehicle not found" });
    }

    res.json(updatedVehicle);
  } catch (err) {
    console.error("Error updating vehicle:", err);
    res.status(400).json({ message: err.message });
  }
};

// getAll
exports.getVehicles = async (req, res) => {
  try {
    let vehicles = await Vehicle.find();

    // Format the response if needed
    const formattedVehicles = vehicles.map(vehicle => ({
      ...vehicle.toObject(),
      image: vehicle.image,
    }));

    res.status(200).json(formattedVehicles);
  } catch (err) {
    console.error("Error fetching vehicles:", err);
    res.status(500).json({ message: err.message });
  }
};

// Delete 
exports.deleteVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) {
      return res.status(404).json({ message: "Vehicle not found" });
    }
    await Vehicle.deleteOne({ _id: req.params.id });
    res.json({ message: "Vehicle deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get  by Season and Day
exports.getVehiclesBySeasonAndDay = async (req, res) => {
  const { season, day } = req.query; 
  
  if (!season || !day) {
    return res.status(400).json({ message: "Season and day are required" });
  }

  try {
    const vehicles = await Vehicle.find({
      [`vprice.${season}.${day}`]: { $exists: true },
    });

    const formattedVehicles = vehicles.map(vehicle => ({
      _id: vehicle._id,
      vehicleID: vehicle.vehicleID,
      vname: vehicle.vname,
      passenger: vehicle.passenger,
      season: season,  
      day: day,
      price: vehicle.vprice[0][season][day],  
    }));

    res.status(200).json(formattedVehicles);
  } catch (err) {
    console.error("Error fetching vehicles:", err);
    res.status(500).json({ message: err.message });
  }
};


// get price 
exports.getVehiclePrice = async (req, res) => {
  const { vehicleID } = req.params;  
  
  try {
    const vehicle = await Vehicle.findOne({ _id: vehicleID });
    if (!vehicle) {
      return res.status(404).json({ message: "Vehicle not found" });
    }
    const seasonData = vehicle.vprice[0]; 
    
    const season = "peakseason";  
    const day = "oneDay";        

    const validSeasons = ["offseason", "secondaryseason", "peakseason"];
    const validDays = ["oneDay", "twoDays", "threeDays", "fourDays", "fiveDays", "sixDays", "weeklyRental"];
    
    if (!validSeasons.includes(season) || !validDays.includes(day)) {
      return res.status(400).json({ message: "Invalid season or day" });
    }

    const price = seasonData[season][day]; 

    if (price !== undefined) {
      return res.status(200).json({
        _id: vehicle._id,
        vehicleID: vehicle.vehicleID,
        vname: vehicle.vname,
        season: season,
        day: day,
        price: price,
        passenger: vehicle.passenger,
      });
    } else {
      return res.status(404).json({ message: "Price not set for selected season and day" });
    }
  } catch (err) {
    console.error("Error fetching vehicle price:", err);
    res.status(500).json({ message: err.message });
  }
};



