import { Viewer, Entity } from "resium";
import { Cartesian3, Ion } from "cesium";
import "cesium/Build/Cesium/Widgets/widgets.css";
import "./index.css";
import { useState, useRef } from "react";
import useSWR from "swr";

Ion.defaultAccessToken =
  "your ion key";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function App() {
  const { data: api, mutate } = useSWR("http://localhost:3000/data", fetcher);
  const viewerRef = useRef<any>(null);

  const [data, setData] = useState<{
    name: string;
    number: string;
  }>({
    name: "",
    number: "",
  });

  async function getCoordinates() {
    navigator.geolocation.getCurrentPosition((data2) => {
      const newCoords = {
        lat: data2.coords.latitude!,
        lng: data2.coords.longitude!,
      };

      fetch("http://localhost:3000/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          lat: newCoords.lat,
          lng: newCoords.lng,
          name: data.name,
          phone: data.number,
        }),
      }).then(() => {
        if (viewerRef.current && newCoords) {
          viewerRef.current.cesiumElement.camera.flyTo({
            destination: Cartesian3.fromDegrees(
              newCoords.lng,
              newCoords.lat,
              1500
            ),
          });
        }
        mutate();
        setData({ name: "", number: "" });
      });
    });
  }

  return (
    <div className="flex w-full h-full">
      <div
        style={{
          position: "absolute",
          top: "10px",
          left: "10px",
          zIndex: 1000,
        }}
        className="w-80 border rounded-lg p-6 shadow-lg bg-white"
      >
        <h2 className="font-bold mb-4 text-center text-red-500 text-3xl">
          H A Z E
        </h2>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-600 mb-1">
            Nombre
          </label>
          <input
            type="text"
            placeholder="Ingresa tu nombre"
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:red-blue-500 focus:red-blue-500"
            value={data.name}
            onChange={(e) => setData({ ...data, name: e.target.value })}
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-600 mb-1">
            Número
          </label>
          <input
            type="text"
            placeholder="Número con +"
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
            value={data.number}
            onChange={(e) => setData({ ...data, number: e.target.value })}
          />
        </div>
        <button
          onClick={getCoordinates}
          type="button"
          className="w-full bg-red-500 text-white font-semibold py-2 rounded hover:bg-red-600 transition-colors"
        >
          Registrate (Necesario dar localización)
        </button>
      </div>
      <Viewer full ref={viewerRef}>
        {api &&
          api.data &&
          api.data.items &&
          Array.isArray(api.data.items) &&
          api.data.items.map((i, k) => (
            <Entity
              key={k}
              description={`Nivel de agua: NORMAL. Tel: ${i.phone}`}
              name={i.name}
              point={{ pixelSize: 10 }}
              position={Cartesian3.fromDegrees(i.lng, i.lat, 100)}
              onClick={() => {
                fetch("http://localhost:3000/call", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ phone: i.phone }),
                });
              }}
            />
          ))}
      </Viewer>
    </div>
  );
}
