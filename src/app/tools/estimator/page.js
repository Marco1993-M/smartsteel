'use client';

import { useState } from 'react';
import emailjs from '@emailjs/browser';
import Head from 'next/head';

const MATERIALS = {
  columns: { length: 3, rate: 467 },
  trusses: {
    8: { length: 4.141, rate: 344.88 },
    10: { length: 5.176, rate: 344.88 },
    12: { length: 6.212, rate: 344.88 },
  },
  topHats: { length: 5.2, rate: 56 },
  postBracket: 155,
  ridgeBracket: 155,
  screw: 0.8,
  sheeting: {
    None: { supply: 0, installed: 0 },
    IBR: { supply: 225, installed: 450 },
    Chromadek: { supply: 350, installed: 450 },
  },
  installRate: 200,
  deliveryRate: 19,
};

const BASE_COORDS = { lat: -25.7239, lng: 28.2297 };

function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export default function EstimatorPage() {
  const [width, setWidth] = useState(8);
  const [length, setLength] = useState(10);
  const [sheeting, setSheeting] = useState('None');
  const [sheetingInstalled, setSheetingInstalled] = useState(false);
  const [distance, setDistance] = useState(0);
  const [usingMyLocation, setUsingMyLocation] = useState(false);
  const [locationError, setLocationError] = useState(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [estimate, setEstimate] = useState(null);
  const [isSending, setIsSending] = useState(false);

  const bayLength = 2.5;
  const fullBays = 1;
  const halfBays = Math.max(Math.ceil((length - bayLength) / bayLength), 0);

  const totalColumns = 4 * fullBays + 2 * halfBays;
  const totalTrusses = 4 * fullBays + 2 * halfBays;
  const totalScrews = 320 * fullBays + 160 * halfBays;
  const totalPostBrackets = totalColumns;
  const totalRidgeBrackets = totalTrusses;

  const rowsOfTopHats = 10;
  const totalTopHatLengthMeters = rowsOfTopHats * length;
  const topHatLengthPerUnit = MATERIALS.topHats.length;
  const topHatUnitsNeeded = Math.ceil(totalTopHatLengthMeters / topHatLengthPerUnit);
  const totalTopHatLengthSold = topHatUnitsNeeded * topHatLengthPerUnit;

  const area = width * length;

  const costColumns = totalColumns * MATERIALS.columns.length * MATERIALS.columns.rate;
  const costTrusses = totalTrusses * MATERIALS.trusses[width].length * MATERIALS.trusses[width].rate;
  const costPostBrackets = totalPostBrackets * MATERIALS.postBracket;
  const costRidgeBrackets = totalRidgeBrackets * MATERIALS.ridgeBracket;
  const costScrews = totalScrews * MATERIALS.screw;
  const costTopHats = totalTopHatLengthSold * MATERIALS.topHats.rate;
  const costSheetingSupply =
    sheeting === 'IBR'
      ? area * MATERIALS.sheeting.IBR.supply
      : sheeting === 'Chromadek'
      ? area * MATERIALS.sheeting.Chromadek.supply
      : 0;

  // Minimum delivery cost R1350
  const deliveryCost = Math.max(distance * MATERIALS.deliveryRate, 1350);

  const installCostPerSqm = 200;
  const costInstallation = sheetingInstalled ? area * installCostPerSqm : 0;

  const totalCost =
    costColumns +
    costTrusses +
    costPostBrackets +
    costRidgeBrackets +
    costScrews +
    costTopHats +
    costSheetingSupply +
    costInstallation +
    deliveryCost;

  const markup = 1.32;
  const finalEstimate = Math.round(totalCost * markup);

  const competitorLowRate = 1100;
  const competitorHighRate = 1400;
  const competitorLow = Math.round(area * competitorLowRate);
  const competitorHigh = Math.round(area * competitorHighRate);

  const savingLow = competitorLow - finalEstimate;
  const savingHigh = competitorHigh - finalEstimate;

  const handleEstimate = () => {
    setEstimate(finalEstimate);
  };

const handleSubmit = (e) => {
  e.preventDefault();

  if (!estimate) {
    alert('Please calculate an estimate first.');
    return;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    alert('Please enter a valid email address.');
    return;
  }

  if (!phone.trim()) {
    alert('Please enter a valid phone number.');
    return;
  }

  setIsSending(true);

  const templateParams = {
    from_name: name,
    from_email: email,
    phone_number: phone,
    estimate: `R${estimate.toLocaleString()}`,
    width,
    length,
    sheeting,
    sheeting_installed: sheetingInstalled ? 'Yes' : 'No',
    delivery_distance: distance,
    // optional if you want them in template:
    // message: 'New estimate request',
    // time: new Date().toLocaleString(),
  };

  emailjs
    .send('service_h817nk1', 'template_rdp28qk', templateParams, 'JIPAN9YaQCPrkSgep')
    .then(() => {
      alert(`Thanks, ${name}! Your estimate of R${estimate.toLocaleString()} was submitted.`);
      setIsSending(false);
      setName('');
      setEmail('');
      setPhone('');
      // setEstimate(null); ❌ maybe don’t clear
      setUsingMyLocation(false);
    })
    .catch((error) => {
      alert('Oops! Something went wrong, please try again later.');
      console.error('EmailJS error:', error);
      setIsSending(false);
    });
};


  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser.');
      return;
    }
    setLocationError(null);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const calculatedDistance = getDistanceFromLatLonInKm(
          BASE_COORDS.lat,
          BASE_COORDS.lng,
          latitude,
          longitude
        );
        setDistance(Number(calculatedDistance.toFixed(1)));
        setUsingMyLocation(true);
      },
      () => {
        setLocationError('Unable to retrieve your location.');
        setUsingMyLocation(false);
      }
    );
  };

  const handleDistanceChange = (e) => {
    setDistance(parseFloat(e.target.value) || 0);
    setUsingMyLocation(false);
  };

  return (
    <>
      <Head>
        <title>Smart Steel Warehouse Estimator | Lightweight Shed Cost Calculator South Africa</title>
        <meta
          name="description"
          content="Calculate your lightweight steel warehouse or shed cost instantly with our free Smart Steel Estimator. Get accurate pricing & save on durable steel structures in SA!"
        />
        <meta name="robots" content="index, follow" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta
          property="og:title"
          content="Smart Steel Warehouse Estimator | Lightweight Shed Cost Calculator South Africa"
        />
        <meta
          property="og:description"
          content="Calculate your lightweight steel warehouse or shed cost instantly with our free Smart Steel Estimator. Get accurate pricing & save on durable steel structures in SA!"
        />
        <meta property="og:type" content="website" />
      </Head>

      <main className="min-h-screen bg-gradient-to-b from-white to-gray-100 p-6 font-sans flex flex-col items-center">
       <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-6 relative">
  <div className="flex justify-center mb-4">
    <img src="/Logo.png" alt="Smart Steel Logo" className="h-16 object-contain" />
  </div>
  <h1 className="text-3xl font-extrabold mb-6 text-center text-gray-900">
    Smart Steel Warehouse Estimator
  </h1>
          <h4 className="text-1xl font-regular mb-6 text-center text-gray-900">
            Lightweight Warehouse Structure
          </h4>

          <div className="space-y-5">
            {/* Inputs Card */}
            <section className="space-y-4">
              <label className="block font-semibold text-gray-700">
                Width (m)
                <select
                  className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-black focus:ring focus:ring-black focus:ring-opacity-20"
                  value={width}
                  onChange={(e) => setWidth(parseInt(e.target.value))}
                >
                  <option value={8}>8m</option>
                  <option value={10}>10m</option>
                  <option value={12}>12m</option>
                </select>
              </label>

              <label className="block font-semibold text-gray-700">
                Length (m)
              <select
  className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-black focus:ring focus:ring-black focus:ring-opacity-20"
  value={length}
  onChange={(e) => setLength(parseFloat(e.target.value))}
>
  {Array.from({ length: 20 }, (_, i) => (i + 1) * 2.5).map((val) => (
    <option key={val} value={val}>
      {val} m
    </option>
  ))}
</select>

              </label>

              <label className="block font-semibold text-gray-700">
                Sheeting
                <select
                  className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-black focus:ring focus:ring-black focus:ring-opacity-20"
                  value={sheeting}
                  onChange={(e) => setSheeting(e.target.value)}
                >
                  <option value="None">None</option>
                  <option value="IBR">IBR</option>
                  <option value="Chromadek">Chromadek</option>
                </select>
              </label>

              <label className="block font-semibold text-gray-700">
                <input
                  type="checkbox"
                  checked={sheetingInstalled}
                  onChange={(e) => setSheetingInstalled(e.target.checked)}
                  className="mr-2"
                />
                Include Installation for Structure
              </label>

              <label className="block font-semibold text-gray-700">
                Delivery Distance (km)
                <div className="flex space-x-2 items-center mt-1">
                  <input
                    type="number"
                    min={0}
                    className="flex-grow rounded-md border border-gray-300 p-2 shadow-sm focus:border-black focus:ring focus:ring-black focus:ring-opacity-20"
                    value={distance}
                    onChange={handleDistanceChange}
                    disabled={usingMyLocation}
                    placeholder="Enter distance or use location"
                  />
                  <button
                    type="button"
                    onClick={handleUseMyLocation}
                    className="rounded bg-red-600 text-white px-3 py-2 hover:bg-red-700 transition"
                  >
                    Use My Location
                  </button>
                </div>
                {locationError && (
                  <p className="text-sm text-red-600 mt-1">{locationError}</p>
                )}
              </label>

              <button
                onClick={handleEstimate}
                className="w-full mt-4 rounded bg-black py-3 text-white font-semibold shadow hover:bg-gray-900 transition"
              >
                Calculate Estimate
              </button>
            </section>

            {/* Estimate Result Card */}
            {estimate !== null && (
              <section className="bg-gray-50 rounded-lg p-5 shadow-inner text-center">
                <h2 className="text-xl font-semibold mb-1 text-gray-800">
                  Estimated Cost
                </h2>
                <p className="text-4xl font-extrabold text-green-600">
                  R {estimate.toLocaleString()}
                </p>

                <div className="mt-3 text-gray-700 text-sm relative inline-block">
                  <span>
                    Compare with Hot-Rolled Steel (Material Only, R1,100–R1,400/m²):
                    <br />
                    ~R{competitorLow.toLocaleString()}–R{competitorHigh.toLocaleString()}
                  </span>
                </div>

                <p className="mt-2 font-semibold text-gray-800">
                  You save up to R{Math.max(savingLow, savingHigh).toLocaleString()} with
                  Smart Steel!
                </p>
              </section>
            )}

            {/* Lead Capture Form Card */}
            {estimate !== null && (
              <form onSubmit={handleSubmit} className="bg-white rounded-lg p-5 shadow-md space-y-4">
                <h2 className="text-lg font-semibold text-gray-900">Get Your Estimate</h2>

                <label className="block text-gray-700 font-medium">
                  Name
                  <input
                    type="text"
                    required
                    className="mt-1 w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-black focus:ring focus:ring-black focus:ring-opacity-20"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your full name"
                    disabled={isSending}
                  />
                </label>

                <label className="block text-gray-700 font-medium">
                  Email
                  <input
                    type="email"
                    required
                    className="mt-1 w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-black focus:ring focus:ring-black focus:ring-opacity-20"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    disabled={isSending}
                  />
                </label>

                <label className="block text-gray-700 font-medium">
  Phone Number
  <input
    type="tel"
    required
    pattern="^[0-9\-\+\s\(\)]{7,15}$"
    className="mt-1 w-full rounded-md border border-gray-300 p-2 shadow-sm 
               focus:border-black focus:ring focus:ring-black focus:ring-opacity-20"
    value={phone}
    onChange={(e) => setPhone(e.target.value)}
    placeholder="e.g. 082 123 4567"
    disabled={isSending}
  />
</label>


                <button
                  type="submit"
                  disabled={isSending}
                  className="w-full rounded bg-black py-2 text-white font-semibold shadow hover:bg-gray-900 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSending ? 'Sending...' : 'Submit Estimate'}
                </button>
              </form>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
