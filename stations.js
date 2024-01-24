const WORLD_LENGTH = 400;
const WORLD_WIDTH = 400;
const MIN_DISTANCE_STATION = 10;

let stationList = [];

function generateUniqueId(length) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let uniqueId = '';

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    uniqueId += characters.charAt(randomIndex);
  }

  return uniqueId;
}

function calculateDistance(location1, location2) {
  const dx = location1.x - location2.x;
  const dy = location1.y - location2.y;
  return Math.sqrt(dx * dx + dy * dy);
}

function genStationLocation() {
  let newLocation;
  do {
    newLocation = {
      x: Math.floor(Math.random() * WORLD_LENGTH),
      y: Math.floor(Math.random() * WORLD_WIDTH)
    };
  } while (
    stationList.some(station => calculateDistance(newLocation, station.location) < MIN_DISTANCE_STATION)
  );

  return newLocation;
}

class TrainStation {
  constructor() {
    this.id = generateUniqueId(6); // Adjust the length as needed
    this.location = genStationLocation();
    this.travelers = [];
  }

  addTraveler(traveler) {
    this.travelers.push(traveler);
  }

  removeTraveler(traveler) {
    const index = this.travelers.indexOf(traveler);
    if (index !== -1) {
      this.travelers.splice(index, 1);
    }
  }

  addToStationList() {
    stationList.push(this);
  }
}

function genStations(numberOfStations) {
  const stations = [];
  for (let i = 0; i < numberOfStations; i++) {
    const station = new TrainStation();
    station.addToStationList(); // Add to stationList outside the constructor
    stations.push(station);
  }
  return stations;
}

// Example usage:
const numberOfStationsToGenerate = 25;
stationList = genStations(numberOfStationsToGenerate);

console.log("stationList:", stationList);
