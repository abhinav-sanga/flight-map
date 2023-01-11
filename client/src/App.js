import './App.css';
import Globe from 'react-globe.gl';
import { useState, useRef, useCallback } from 'react';
// import { getAllFlights } from './services/flight-api';
import { MockData } from './services/mockData';
import { AirportData } from './services/airportData';

const ARC_REL_LEN = 0.8; // relative to whole arc
const FLIGHT_TIME = 5000;
const NUM_RINGS = 3;
const RINGS_MAX_R = 5; // deg
const RING_PROPAGATION_SPEED = 5;

function App() {
  const [arcsData, setArcsData] = useState([]);
  const [ringsData, setRingsData] = useState([]);
  const globeEl = useRef();

  const prevCoords = useRef({ lat: 0, lng: 0 });
  const emitArc = useCallback((strLat, strLng, endLat, endLng, color) => {
    prevCoords.current = { lat: strLat, lng: strLng };
    const { lat: startLat, lng: startLng } = prevCoords.current;
    prevCoords.current = { lat: endLat, lng: endLng };

    // add and remove arc after 1 cycle
    const arc = { startLat, startLng, endLat, endLng, color };
    setArcsData(curArcsData => [...curArcsData, arc]);
    setTimeout(() => setArcsData(curArcsData => curArcsData.filter(d => d !== arc)), FLIGHT_TIME * 2);

    // add and remove start rings
    const srcRing = { lat: startLat, lng: startLng };
    setRingsData(curRingsData => [...curRingsData, srcRing]);
    setTimeout(() => setRingsData(curRingsData => curRingsData.filter(r => r !== srcRing)), FLIGHT_TIME * ARC_REL_LEN);

    // add and remove target rings
    setTimeout(() => {
      const targetRing = { lat: endLat, lng: endLng };
      setRingsData(curRingsData => [...curRingsData, targetRing]);
      setTimeout(() => setRingsData(curRingsData => curRingsData.filter(r => r !== targetRing)), FLIGHT_TIME * ARC_REL_LEN);
    }, FLIGHT_TIME);
  });

  const getPortLatLong = (code) => {
    return AirportData.find(port => {
      return port.icao === code;
    })
  }

  const getFlights = () => {
    console.log(globeEl.current.controls());
    globeEl.current.controls().autoRotateSpeed = 2;
    globeEl.current.controls().autoRotate = true;
    let finalData = [];
    if (Array.isArray(MockData)) {
      MockData.forEach(flight => {
        if (flight.live && !flight.live.is_ground) {
          finalData.push(flight);
        }
      });
    }
    for (let i = 0; i < finalData.length; i++) {
      setTimeout(() => {
        let depData = getPortLatLong(finalData[i].departure.icao);
        let arrData = getPortLatLong(finalData[i].arrival.icao);
        let color = "#" + ((1 << 24) * Math.random() | 0).toString(16).padStart(6, "0");

        emitArc(parseFloat(depData.lat), parseFloat(depData.lon), parseFloat(arrData.lat), parseFloat(arrData.lon), color);
      }, i * 1000);
    }
  }

  return (
    <Globe
      ref={globeEl}
      globeImageUrl="//unpkg.com/three-globe/example/img/earth-night.jpg"
      backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"
      onGlobeReady={getFlights}
      arcsData={arcsData}
      arcDashLength={ARC_REL_LEN}
      arcDashGap={2}
      arcDashInitialGap={1}
      arcDashAnimateTime={FLIGHT_TIME}
      arcsTransitionDuration={0}
      ringsData={ringsData}
      ringColor={() => t => `rgba(255,100,50,${1 - t})`}
      ringMaxRadius={RINGS_MAX_R}
      ringPropagationSpeed={RING_PROPAGATION_SPEED}
      ringRepeatPeriod={FLIGHT_TIME * ARC_REL_LEN / NUM_RINGS} />
  );
}

export default App;
