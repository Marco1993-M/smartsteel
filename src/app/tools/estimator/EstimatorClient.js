'use client';

import { useEffect, useMemo, useState } from 'react';
import emailjs from '@emailjs/browser';
import Image from 'next/image';
import Link from 'next/link';
import { supabase } from "../../../lib/supabase";
import {
  formatCurrency,
  WAREHOUSE_CLADDING_OPTIONS,
  WAREHOUSE_LENGTH_OPTIONS,
  WAREHOUSE_WIDTH_OPTIONS,
} from "../../../lib/estimates/warehouseEstimate";
import {
  calculateEstimateByProductType,
} from "../../../lib/estimates/estimateFactory";
import {
  LCSS_WAREHOUSE_GABLE_OPTIONS,
  LCSS_WAREHOUSE_STEEL_FINISH_OPTIONS,
  LCSS_WAREHOUSE_WIDTH_OPTIONS,
} from "../../../lib/estimates/warehouseEstimateLcss";

let lastAllocatedIndex = 0;
const team = ['Stefan', 'Niel', 'Marco'];

const getNextAllocation = () => {
  const allocatedTo = team[lastAllocatedIndex % team.length];
  lastAllocatedIndex++;
  return allocatedTo;
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
  const [productType, setProductType] = useState('LSF Warehouse');
  const [width, setWidth] = useState(8);
  const [length, setLength] = useState(10);
  const [wallHeight, setWallHeight] = useState(3);
  const [cladding, setCladding] = useState('None'); // ✅ renamed
  const [claddingInstalled, setCladdingInstalled] = useState(false); // ✅ renamed
  const [steelFinish, setSteelFinish] = useState('Galv');
  const [gableMode, setGableMode] = useState('sheeted_gable');
  const [distance, setDistance] = useState(0);
  const [usingMyLocation, setUsingMyLocation] = useState(false);
  const [locationError, setLocationError] = useState(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [estimate, setEstimate] = useState(null);
  const [isSending, setIsSending] = useState(false);
  const isLcssWarehouse = productType === 'LCSS Warehouse';
  const productTypeLabel = isLcssWarehouse ? 'CFLC Warehouse' : 'LSF Warehouse';

  useEffect(() => {
    if (isLcssWarehouse) {
      setWidth((current) => (LCSS_WAREHOUSE_WIDTH_OPTIONS.includes(current) ? current : 6));
      setCladdingInstalled(false);
      setDistance(0);
      setUsingMyLocation(false);
      setLocationError(null);
    } else {
      setWidth((current) => (WAREHOUSE_WIDTH_OPTIONS.includes(current) ? current : 8));
      setWallHeight(3);
    }
    setEstimate(null);
  }, [isLcssWarehouse]);

  const estimatePreview = useMemo(
    () =>
      calculateEstimateByProductType(productType, {
        width,
        length,
        wallHeight,
        cladding,
        claddingInstalled,
        deliveryDistance: distance,
        steelFinish,
        gableMode,
      }),
    [cladding, claddingInstalled, distance, gableMode, length, productType, steelFinish, wallHeight, width]
  );

  const handleEstimate = () => {
    setEstimate(estimatePreview);
  };

  const handleSubmit = async (e) => {
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
      estimate: formatCurrency(
        isLcssWarehouse ? estimate.pricing.totalInclVat : estimate.pricing.estimatedTotal
      ),
      product_type: productType,
      width,
      length,
      height: wallHeight,
      cladding: isLcssWarehouse ? steelFinish : cladding,
      cladding_installed: isLcssWarehouse ? 'N/A' : claddingInstalled ? 'Yes' : 'No',
      delivery_distance: distance,
    };

    try {
      // 1. Send email via EmailJS
      await emailjs.send(
        'service_h817nk1',
        'template_rdp28qk',
        templateParams,
        'JIPAN9YaQCPrkSgep'
      );

      // 2. Save lead to Supabase (with fallback last_name + cladding)

      const allocatedTo = getNextAllocation();

      const { data, error } = await supabase.from('leads').insert([
        {
          name,
          last_name: "Unknown", // ✅ fallback
          email,
          phone,
          width,
          length,
          wall_height: wallHeight,
          delivery_distance: distance,
          allocated_to: allocatedTo,
          status: 'new',
          cladding: isLcssWarehouse ? steelFinish : cladding,
          estimate_request: estimate.summary.estimateRequest,
          lead_source: "Estimator",
          product_type: productType,
          next_action: "Review estimator enquiry and send formal quote",
          quote_value: isLcssWarehouse ? estimate.pricing.totalInclVat : estimate.pricing.estimatedTotal,
          created_at: new Date().toISOString(),
        },
      ]);

      if (error) throw error;

      alert(`Thanks, ${name}! Your estimate of ${formatCurrency(isLcssWarehouse ? estimate.pricing.totalInclVat : estimate.pricing.estimatedTotal)} was submitted.`);

      // reset
      setIsSending(false);
      setName('');
      setEmail('');
      setPhone('');
      setUsingMyLocation(false);

    } catch (error) {
      alert('Oops! Something went wrong, please try again later.');
      console.error('Submission error:', error);
      setIsSending(false);
    }
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
      <main className="min-h-screen bg-gradient-to-b from-white to-gray-100 p-6 font-sans flex flex-col items-center">
        <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-6 relative">
          <div className="flex justify-center mb-4">
            <Image src="/Logo.png" alt="Smart Steel Logo" width={160} height={64} className="h-16 w-auto object-contain" />
          </div>
          <h1 className="text-3xl font-extrabold mb-6 text-center text-gray-900">
            Smart Steel Warehouse Estimator
          </h1>
          <h4 className="text-1xl font-regular mb-6 text-center text-gray-900">
            Choose your warehouse system, then price the right structure path
          </h4>
          <div className="mb-6 rounded-xl border border-red-100 bg-red-50 p-4 text-center">
            <p className="text-sm font-semibold text-gray-900">Want to shape the building visually first?</p>
            <Link href="/warehouse-builder" className="mt-2 inline-block text-sm font-semibold text-[#da1a33] underline underline-offset-4">
              Try the Smart Steel Warehouse Builder
            </Link>
          </div>

          <div className="space-y-5">
            {/* Inputs Card */}
            <section className="space-y-4">
              <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                <p className="text-sm font-semibold text-gray-900">Warehouse system</p>
                <p className="mt-1 text-sm text-gray-600">
                  Start by choosing the system you want priced. The estimator will then switch to the relevant commercial logic.
                </p>
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  {[
                    { value: 'LSF Warehouse', label: 'LSF Warehouse' },
                    { value: 'LCSS Warehouse', label: 'CFLC Warehouse' },
                  ].map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setProductType(option.value)}
                      className={`rounded-xl border px-4 py-3 text-left text-sm font-semibold transition ${
                        productType === option.value
                          ? 'border-black bg-black text-white'
                          : 'border-gray-200 bg-white text-gray-800 hover:border-gray-400'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <label className="block font-semibold text-gray-700">
                Width (m)
                <select
                  className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-black focus:ring focus:ring-black focus:ring-opacity-20"
                  value={width}
                  onChange={(e) => setWidth(parseInt(e.target.value))}
                >
                  {(isLcssWarehouse ? LCSS_WAREHOUSE_WIDTH_OPTIONS : WAREHOUSE_WIDTH_OPTIONS).map((option) => (
                    <option key={option} value={option}>
                      {option}m
                    </option>
                  ))}
                </select>
              </label>

              <label className="block font-semibold text-gray-700">
                Length (m)
                <select
                  className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-black focus:ring focus:ring-black focus:ring-opacity-20"
                  value={length}
                  onChange={(e) => setLength(parseFloat(e.target.value))}
                >
                  {WAREHOUSE_LENGTH_OPTIONS.map((val) => (
                    <option key={val} value={val}>
                      {val} m
                    </option>
                  ))}
                </select>
              </label>

              {isLcssWarehouse ? (
                <>
                  <label className="block font-semibold text-gray-700">
                    Wall Height (m)
                    <input
                      type="number"
                      min={2}
                      step={0.1}
                      className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-black focus:ring focus:ring-black focus:ring-opacity-20"
                      value={wallHeight}
                      onChange={(e) => setWallHeight(parseFloat(e.target.value) || 3)}
                    />
                  </label>

                  <label className="block font-semibold text-gray-700">
                    Steel Finish
                    <select
                      className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-black focus:ring focus:ring-black focus:ring-opacity-20"
                      value={steelFinish}
                      onChange={(e) => setSteelFinish(e.target.value)}
                    >
                      {LCSS_WAREHOUSE_STEEL_FINISH_OPTIONS.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="block font-semibold text-gray-700">
                    Gable Type
                    <select
                      className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-black focus:ring focus:ring-black focus:ring-opacity-20"
                      value={gableMode}
                      onChange={(e) => setGableMode(e.target.value)}
                    >
                      {LCSS_WAREHOUSE_GABLE_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>
                </>
              ) : (
                <>
                  <label className="block font-semibold text-gray-700">
                    Cladding
                    <select
                      className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-black focus:ring focus:ring-black focus:ring-opacity-20"
                      value={cladding}
                      onChange={(e) => setCladding(e.target.value)}
                    >
                      {WAREHOUSE_CLADDING_OPTIONS.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="block font-semibold text-gray-700">
                    <input
                      type="checkbox"
                      checked={claddingInstalled}
                      onChange={(e) => setCladdingInstalled(e.target.checked)}
                      className="mr-2"
                    />
                    Include Installation for Structure
                  </label>
                </>
              )}

              {!isLcssWarehouse ? (
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
              ) : (
                <div className="rounded-xl border border-amber-100 bg-amber-50 p-4 text-sm text-amber-900">
                  This CFLC estimate gives you a practical starting point for the structure price.
                  Delivery, sheeting, and installation can still be added once your full project
                  details are confirmed.
                </div>
              )}

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
                  {isLcssWarehouse ? 'Estimated Cost (incl. VAT)' : 'Estimated Cost'}
                </h2>
                <p className="text-4xl font-extrabold text-green-600">
                  {formatCurrency(isLcssWarehouse ? estimate.pricing.totalInclVat : estimate.pricing.estimatedTotal)}
                </p>

                {!isLcssWarehouse && estimate.marketComparison ? (
                  <>
                    <div className="mt-3 text-gray-700 text-sm relative inline-block">
                      <span>
                        Compare with Hot-Rolled Steel (Material Only, R1,100–R1,400/m²):
                        <br />
                        ~{formatCurrency(estimate.marketComparison.competitorLow)}–{formatCurrency(estimate.marketComparison.competitorHigh)}
                      </span>
                    </div>

                    <p className="mt-2 font-semibold text-gray-800">
                      You save up to {formatCurrency(estimate.marketComparison.maxSaving)} with Smart Steel!
                    </p>
                  </>
                ) : (
                  <div className="mt-3 rounded-lg border border-gray-200 bg-white p-3 text-left text-sm text-gray-700">
                    <p className="font-semibold text-gray-900">CFLC warehouse summary</p>
                    <p className="mt-1">
                      This estimate gives you a clear starting budget for a CFLC warehouse.
                    </p>
                    <p className="mt-2 text-xs text-gray-500">
                      Final pricing is confirmed once the full design scope, sheeting, delivery, and project details are reviewed.
                    </p>
                  </div>
                )}

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
                    pattern="^[0-9\\-\\+\\s\\(\\)]{7,15}$"
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

                {/* Call Button */}
                <a
                  href="tel:+27826576522"
                  className="w-full mt-2 inline-block text-center rounded bg-white py-2 text-black font-semibold shadow hover:bg-gray-100 transition"
                >
                  Call Instead
                </a>
              </form>
            )}
          </div>
        </div>
      </main>
  );
}
