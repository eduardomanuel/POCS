const WORLD_LENGTH = 400;
const WORLD_WIDTH = 400;
const MIN_DISTANCE_STATION = 5;
const MAX_COL_COUNT = 100000;
const MAX_TRAIN_RANGE = 10;
const MAX_TRAIN_CAPACITY = 5;
const SIM_STEP_TIME = 100;
const MAX_STATIONS = 5;
const MAX_TRAVELERS = 200;
const MAX_REPEAT_TRAIL = 5;  // Adjust as needed
const TRAIL_LENGTH = 500;
const MAX_TRAINS = 5;  // Set the desired maximum number of trains


let trainList = [];
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
    let colCount = 0;
    do {
        newLocation = {
            x: Math.floor(Math.random() * WORLD_LENGTH),
            y: Math.floor(Math.random() * WORLD_WIDTH)
        };
        //console.log("collisions in getting location :", colCount++);
        if (colCount++ >= MAX_COL_COUNT) throw "could not get location";
    } while (
        stationList.some(station => calculateDistance(newLocation, station.location) < MIN_DISTANCE_STATION)
    );

    return newLocation;
}

function genTravelers(count) {
    let travelers = [];
    while (travelers.length < count) {
        let newTraveler = {
            id: generateUniqueId(12),
            start: stationList[Math.floor(Math.random() * (stationList.length - 1))].id,
            destination: stationList[Math.floor(Math.random() * (stationList.length - 1))].id
        }
        travelers.push(newTraveler);
    }
    return travelers;
}

function assignTravelersToStations(travelers) {
    travelers.forEach(traveler => {
        const startStation = stationList.find(station => station.id === traveler.start);

        if (startStation) {
            startStation.addTraveler(traveler);
        } else {
            console.error(`Could not find station with ID ${traveler.start} for traveler ${traveler.id}`);
        }
    });
}

function noMoreTravelers() {
    const totalTravelers = stationList.reduce((total, station) => total + station.travelers.length, 0);
    return (totalTravelers === 0);
}


class Train {
    constructor(startLocationID) {
        console.log(`\n\n\nSim starting with station :${JSON.stringify(stationList.find(s => s.id == startLocationID))}`);

        this.currentStation = startLocationID;
        this.id = generateUniqueId(6);
        this.range = Math.floor(Math.random() * MAX_TRAIN_RANGE);
        this.capacity = Math.floor(Math.random() * MAX_TRAIN_CAPACITY);
        this.travelers = [];
        this.trail = [];
    }

    static createTrains(numberOfTrains, startStationIDs) {
        const trains = [];
        for (let i = 0; i < numberOfTrains; i++) {
            const startStationID = startStationIDs[i % startStationIDs.length];
            const train = new Train(startStationID);
            trains.push(train);
        }
        return trains;
    }


    updateTrail(station) {
        // Shift the elements in the trail to make space for the new station
        if (this.trail.length >= TRAIL_LENGTH)
            this.trail.shift();
        // Add the current station to the end of the trail
        this.trail.push(station);
    }

    findNearestStationWithPassengers() {
        const currentStation = stationList.find(station => station.id === this.currentStation);
        if (!currentStation) {
            console.error(`Invalid station: ${this.currentStation}`);
            return null;
        }

        const nearestStation = stationList.reduce((nearest, station) => {
            if (station.id !== this.currentStation && station.travelers.length > 0) {
                const distanceToStation = calculateDistance(currentStation.location, station.location);
                if (distanceToStation < nearest.distance) {
                    return { station: station.id, distance: distanceToStation };
                }
            }
            return nearest;
        }, { station: null, distance: Number.MAX_VALUE });

        return nearestStation.station;
    }


    loopInTrail(trail) {

        function findRepeatablePattern(trail) {
            const repeatableEntries = [];

            for (let i = 0; i < trail.length; i++) {
                let next = trail[i];
                if (trail.filter(e => e == next).length >= MAX_REPEAT_TRAIL) repeatableEntries.push(next);
            }

            for (let i = 0; i < repeatableEntries.length; i++) {
                let nextEntry = repeatableEntries[i];
                let indexes = getAllIndexes(trail, nextEntry);
                if (!isArithmeticSequence(indexes)) continue;  //skip if is not a repeatable pattern 
                let pattern = trail.slice(indexes[0], indexes[1]);
                let occurrences = countOccurrences(pattern, trail);
                if (occurrences >= MAX_REPEAT_TRAIL) {
                    console.log(`\n\n\n  **** Loop detected !\n
                    repeated station :${nextEntry}\n 
                    pattern found:${pattern}\n
                    Indexes :${JSON.stringify(indexes)}`);
                    return true;
                }
            }


            return false;
        }

        function isArithmeticSequence(arr) {
            if (arr.length < 2) {
                return true;  // An empty or single-element array is considered an arithmetic sequence
            }

            const commonDifference = arr[1] - arr[0];

            for (let i = 1; i < arr.length - 1; i++) {
                if (arr[i + 1] - arr[i] !== commonDifference) {
                    return false;
                }
            }

            return true;
        }

        function countOccurrences(p, list) {
            // Iterate through the list to count occurrences
            let count = 0;
            for (let i = 0; i < list.length; i++) {
                // Check if the current position in the list matches the pattern p
                if (JSON.stringify(list.slice(i, i + p.length)) === JSON.stringify(p)) {
                    count++;
                }
            }
            return count;
        }

        // Function to get all indexes of a specific value in an array
        function getAllIndexes(arr, val) {
            const indexes = [];
            for (let i = 0; i < arr.length; i++) {
                if (JSON.stringify(arr[i]) === JSON.stringify(val)) {
                    indexes.push(i);
                }
            }
            return indexes;
        }


        // Check for repeatable pattern in the trail
        const hasRepeatablePattern = findRepeatablePattern(trail);

        // If a repeatable pattern is found, return true; otherwise, return false
        return hasRepeatablePattern;
    }




    startSimulation() {
        this.simulationInterval = setInterval(() => {
            // Call your simulation steps here
            this.simulationStep();
        }, SIM_STEP_TIME);
    }

    stopSimulation() {
        console.log("\n\nEnding sim...");
        clearInterval(this.simulationInterval);
    }

    simulationStep() {
        this.deBoardTrain();
        this.boardTravelers();
        this.advance();
        if (noMoreTravelers() && this.travelers.length === 0) {
            console.log("\n\nAll travelers have reached their destinations!");
            console.log("\n\nSee trail below");
            console.log(this.trail);
            this.stopSimulation();
        }
        if (this.loopInTrail(this.trail)) {
            let nextStation = pickRandomStation();
            console.error("\n\n\n\ *******  We have fallen into a loop! Sending train to ", nextStation.id);
            this.updateCurrentStation(nextStation.id);
            // console.log(JSON.stringify(this.trail));
            // this.stopSimulation();
        }
    }

    boardTravelers() {
        const thisStation = stationList.find(s => s.id == this.currentStation);

        if (thisStation.travelers.length == 0) {
            console.log("No passengers at this station");
            return;
        }
        else {
            console.log(`${thisStation.travelers.length} Travelers are waiting at this station. \n
            this train has capacity for ${this.capacity - this.travelers.length} additional travelers`);
        }

        if (!thisStation) {
            throw `Invalid station: ${this.currentStation}`;
        }

        while (this.travelers.length < this.capacity) {
            if (thisStation.travelers.length > 0) {
                const randomIndex = Math.floor(Math.random() * thisStation.travelers.length);
                const randomTraveler = thisStation.travelers[randomIndex];

                // Use the removeTraveler method of TrainStation to remove the traveler
                thisStation.removeTraveler(randomTraveler);

                this.travelers.push(randomTraveler);
            } else {
                break;  // no more travelers at this station
            }
        }
        if (thisStation.travelers.length > 0) {
            console.log(`Train has filled up.  ${thisStation.travelers.length} will have to wait for the next train`);
        }
    }


    deBoardTrain() {
        const currentStation = stationList.find(station => station.id === this.currentStation);

        console.log(`\nTrain [${this.id}] is at station :`, currentStation.id);

        if (currentStation) {
            // Filter travelers whose destination is the current station
            let travelersToDeboard = this.travelers.filter(traveler => traveler.destination === this.currentStation);
            let passengersGettingOff = travelersToDeboard.length;
            while (travelersToDeboard.length > 0) {
                let nextTraveler = travelersToDeboard.pop();
                // remove traveler from the train
                this.travelers = this.travelers.filter(t => t.id != nextTraveler.id);
                console.log(`the following traveler has deboarded the tran :${JSON.stringify(nextTraveler)}`);
            }
            console.log(`${passengersGettingOff} travelers got off at this station`);
        } else {
            console.error(`Could not find station with ID ${this.currentStation} for deboarding travelers.`);
        }
    }



    advance() {
        if (this.travelers.length > 0) {
            // If there are travelers on the train, handle the situation
            this.handleTravelersOnTrain();
        } else {
            // If there are no travelers on the train, handle the situation
            this.handleNoTravelersOnTrain();
        }
        // Update the trail with the current station
        this.updateTrail(this.currentStation);
    }

    handleTravelersOnTrain() {
        // Calculate the count of travelers going to each destination
        const destinationsCount = this.calculateDestinationsCount();

        // Get the most popular destination based on traveler counts
        const mostPopularDestination = this.getMostPopularDestination(destinationsCount);

        // Calculate the distance to the next station based on the most popular destination
        const distanceToNextStation = this.calculateDistanceToNextStation(mostPopularDestination);

        // Check if the distance to the next station is greater than the maximum train range
        if (distanceToNextStation > MAX_TRAIN_RANGE) {
            // If so, find the nearest station to the most popular destination
            const nearestStation = this.findNearestStation(this.currentStation, mostPopularDestination);
            console.log(`going to the nearest station:${nearestStation} distance_to_next=`, distanceToNextStation);
            // Update the current station to the nearest station
            this.updateCurrentStation(nearestStation);
        } else {
            // If the distance to the next station is within the maximum train range, update the current station
            console.log("going to the station where most travelers want to go..", mostPopularDestination);
            this.updateCurrentStation(mostPopularDestination);
        }
    }

    handleNoTravelersOnTrain() {
        // Find the nearest station with passengers waiting
        const nearestStationWithPassengers = this.findNearestStationWithPassengers();

        // Check if a valid station with passengers was found
        if (nearestStationWithPassengers !== null) {
            // If found, update the current station to the nearest station with passengers
            this.updateCurrentStation(nearestStationWithPassengers);
        } else {
            // If no valid station with passengers was found, log an error
            console.error(`No valid station found with passengers waiting for the train with ID ${this.id}.`);
        }
    }


    calculateDestinationsCount() {
        const destinationsCount = {};
        this.travelers.forEach(traveler => {
            destinationsCount[traveler.destination] = (destinationsCount[traveler.destination] || 0) + 1;
        });
        return destinationsCount;
    }

    getMostPopularDestination(destinationsCount) {
        return Object.keys(destinationsCount).reduce((a, b) => destinationsCount[a] > destinationsCount[b] ? a : b);
    }

    calculateDistanceToNextStation(destination) {
        const currentStationLocation = stationList.find(station => station.id === this.currentStation).location;
        const destinationLocation = stationList.find(station => station.id === destination).location;
        return calculateDistance(currentStationLocation, destinationLocation);
    }

    updateCurrentStation(station) {
        if (station !== null) {
            this.currentStation = station;
        } else {
            console.error(`No valid station found for the train with ID ${this.id}.`);
        }
    }


    findNearestStation(startStation, targetStation) {
        // Find the nearest station between the start station and the target station.
        const startLocation = stationList.find(station => station.id === startStation).location;
        const targetLocation = stationList.find(station => station.id === targetStation).location;

        const nearestStation = stationList.reduce((nearest, station) => {
            if (station.id !== startStation) {
                const distanceToStation = calculateDistance(startLocation, station.location);
                const distanceToTarget = calculateDistance(targetLocation, station.location);

                if (distanceToStation < nearest.distance && distanceToTarget < MAX_TRAIN_RANGE) {
                    return { station: station.id, distance: distanceToStation };
                }
            }
            return nearest;
        }, { station: null, distance: Number.MAX_VALUE });

        return nearestStation.station;
    }


}


class TrainStation {
    constructor() {
        this.id = generateUniqueId(12); // Adjust the length as needed
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
        } else {
            console.error(`Traveler with ID ${traveler.id} not found at station ${this.id}.`);
            // You can throw an error here if you want to handle it in a more explicit way
            // throw new Error(`Traveler with ID ${traveler.id} not found at station ${this.id}.`);
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

function pickStartStation() {
    // Filter stations that have passengers waiting
    const stationsWithPassengers = stationList.filter(station => station.travelers.length > 0);

    if (stationsWithPassengers.length > 0) {
        // If there are stations with passengers, randomly pick one
        const randomIndex = Math.floor(Math.random() * stationsWithPassengers.length);
        return stationsWithPassengers[randomIndex].id;
    } else {
        console.error("No stations with passengers were found!");
        return null;
    }
}

function pickRandomStation(){
    return stationList[Math.floor(Math.random() * (stationList.length -1))];
}


function startMultipleTrainSimulations(numberOfTrains) {
    stationList = genStations(MAX_STATIONS);
    assignTravelersToStations(genTravelers(MAX_TRAVELERS));

    const startStationIDs = Array.from({ length: numberOfTrains }, () => pickStartStation());
    trainList = Train.createTrains(numberOfTrains, startStationIDs);

    trainList.forEach(train => train.startSimulation());
}

startMultipleTrainSimulations(MAX_TRAINS);
