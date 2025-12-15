import { useEffect, useState, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import axios from 'axios';
import { FaMapMarkerAlt, FaSpinner, FaUniversity } from 'react-icons/fa';
import 'leaflet/dist/leaflet.css';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface AlumniData {
  id: string;
  name?: string;
  major?: string;
  graduationYear?: number;
}

interface UniversityData {
  university: string;
  count: number;
  type?: 'negeri' | 'swasta' | 'kedinasan';
  alumni: AlumniData[];
}

interface GeocodedUniversity extends UniversityData {
  lat?: number;
  lng?: number;
}

function MapBounds({ universities }: { universities: GeocodedUniversity[] }) {
  const map = useMap();

  useEffect(() => {
    const validUniversities = universities.filter(
      (u) => u.lat !== undefined && u.lng !== undefined
    );

    if (validUniversities.length > 0) {
      const bounds = L.latLngBounds(
        validUniversities.map((u) => [u.lat!, u.lng!])
      );
      map.fitBounds(bounds, { padding: [50, 50] });
    } else {
      map.setView([-2.5489, 118.0149], 5);
    }
  }, [map, universities]);

  return null;
}

const InteractiveAlumniMap = ({ apiEndpoint }: { apiEndpoint: string }) => {
  const [universities, setUniversities] = useState<GeocodedUniversity[]>([]);
  const [loading, setLoading] = useState(true);
  const [geocodingProgress, setGeocodingProgress] = useState(0);

  const getMarkerIcon = (count: number, type?: string) => {
    const size = Math.min(30 + count * 2, 50);
    let color = '#3388ff';

    if (type === 'negeri') {
      color = '#10b981';
    } else if (type === 'swasta') {
      color = '#8b5cf6';
    } else if (type === 'kedinasan') {
      color = '#ec4899';
    }

    return L.divIcon({
      className: 'custom-marker',
      html: `<div style="
        background-color: ${color};
        width: ${size}px;
        height: ${size}px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: bold;
        font-size: ${Math.max(12, size * 0.4)}px;
      ">${count}</div>`,
      iconSize: [size, size],
      iconAnchor: [size / 2, size / 2],
      popupAnchor: [0, -size / 2],
    });
  };

  const geocodeUniversity = async (
    universityName: string
  ): Promise<{ lat: number; lng: number } | null> => {
    try {
      const query = encodeURIComponent(`${universityName}, Indonesia`);
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'TracerStudyApp/1.0',
          },
        }
      );

      const data = await response.json();
      if (data && data.length > 0) {
        return {
          lat: parseFloat(data[0].lat),
          lng: parseFloat(data[0].lon),
        };
      }
      return null;
    } catch (error) {
      console.error(`Geocoding error for ${universityName}:`, error);
      return null;
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await axios.get<UniversityData[]>(apiEndpoint);
        const universityData = response.data;

        const geocodedUniversities: GeocodedUniversity[] = [];
        const total = universityData.length;

        for (let i = 0; i < universityData.length; i++) {
          const university = universityData[i];
          setGeocodingProgress(((i + 1) / total) * 100);

          const coords = await geocodeUniversity(university.university);
          geocodedUniversities.push({
            ...university,
            lat: coords?.lat,
            lng: coords?.lng,
          });

          if (i < universityData.length - 1) {
            await new Promise((resolve) => setTimeout(resolve, 1000));
          }
        }

        setUniversities(geocodedUniversities);
      } catch (error) {
        console.error('Error fetching alumni map data:', error);
      } finally {
        setLoading(false);
        setGeocodingProgress(0);
      }
    };

    fetchData();
  }, [apiEndpoint]);

  const validUniversities = useMemo(
    () =>
      universities.filter((u) => u.lat !== undefined && u.lng !== undefined),
    [universities]
  );

  const getUniversityTypeLabel = (type?: string) => {
    switch (type) {
      case 'negeri':
        return 'PTN';
      case 'swasta':
      case 'kedinasan':
        return 'Kedinasan';
      default:
        return 'Universitas';
    }
  };

  if (loading) {
    return (
      <div className='card h-[500px]'>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '430px',
            gap: '16px',
          }}
        >
          <FaSpinner className='spinner' style={{ fontSize: '32px' }} />
          <p style={{ color: 'var(--text-secondary)' }}>
            {geocodingProgress > 0
              ? `Memuat lokasi universitas... ${Math.round(geocodingProgress)}%`
              : 'Memuat data alumni...'}
          </p>
        </div>
      </div>
    );
  }

  if (validUniversities.length === 0) {
    return (
      <div className='card' style={{ minHeight: '500px' }}>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '500px',
            gap: '16px',
            color: 'var(--text-tertiary)',
          }}
        >
          <FaMapMarkerAlt style={{ fontSize: '48px' }} />
          <p>Tidak ada data universitas yang dapat ditampilkan di peta</p>
        </div>
      </div>
    );
  }

  return (
    <div className='card h-[500px]'>
      <h2
        style={{
          marginBottom: '24px',
          color: 'var(--text-primary)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          fontSize: '20px',
        }}
      >
        <FaMapMarkerAlt />
        <span>Persebaran Alumni Berdasarkan Universitas</span>
      </h2>
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '290px',
          borderRadius: '8px',
          overflow: 'hidden',
          border: '1px solid var(--border-color)',
        }}
      >
        <MapContainer
          center={[-2.5489, 118.0149]}
          zoom={5}
          style={{ height: '100%', width: '100%', zIndex: 1 }}
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
          />
          <MapBounds universities={validUniversities} />
          {validUniversities.map((university, index) => (
            <Marker
              key={index}
              position={[university.lat!, university.lng!]}
              icon={getMarkerIcon(university.count, university.type)}
            >
              <Popup>
                <div style={{ minWidth: '200px', maxWidth: '300px' }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      marginBottom: '12px',
                    }}
                  >
                    <FaUniversity style={{ color: 'var(--primary)' }} />
                    <h3
                      style={{
                        margin: 0,
                        fontSize: '16px',
                        fontWeight: 'bold',
                        color: 'var(--text-primary)',
                      }}
                    >
                      {university.university}
                    </h3>
                  </div>
                  <div
                    style={{
                      marginBottom: '8px',
                      padding: '8px',
                      background: 'var(--bg-tertiary)',
                      borderRadius: '6px',
                    }}
                  >
                    <div
                      style={{
                        fontSize: '14px',
                        color: 'var(--text-secondary)',
                      }}
                    >
                      <strong>Jenis:</strong>{' '}
                      {getUniversityTypeLabel(university.type)}
                    </div>
                    <div
                      style={{
                        fontSize: '14px',
                        color: 'var(--text-secondary)',
                      }}
                    >
                      <strong>Jumlah Alumni:</strong> {university.count}
                    </div>
                  </div>
                  {university.alumni && university.alumni.length > 0 && (
                    <div style={{ marginTop: '12px' }}>
                      <div
                        style={{
                          fontSize: '12px',
                          fontWeight: 'bold',
                          color: 'var(--text-primary)',
                          marginBottom: '8px',
                        }}
                      >
                        Daftar Alumni:
                      </div>
                      <div
                        style={{
                          maxHeight: '200px',
                          overflowY: 'auto',
                          fontSize: '12px',
                        }}
                      >
                        {university.alumni.slice(0, 10).map((alumni, idx) => (
                          <div
                            key={idx}
                            style={{
                              padding: '6px',
                              marginBottom: '4px',
                              background: 'var(--bg-card)',
                              borderRadius: '4px',
                              border: '1px solid var(--border-color)',
                            }}
                          >
                            <div
                              style={{
                                fontWeight: '600',
                                color: 'var(--text-primary)',
                              }}
                            >
                              {alumni.name || 'N/A'}
                            </div>
                            {alumni.major && (
                              <div
                                style={{
                                  color: 'var(--text-secondary)',
                                  fontSize: '11px',
                                }}
                              >
                                {alumni.major}
                              </div>
                            )}
                            {alumni.graduationYear && (
                              <div
                                style={{
                                  color: 'var(--text-tertiary)',
                                  fontSize: '11px',
                                }}
                              >
                                Lulus: {alumni.graduationYear}
                              </div>
                            )}
                          </div>
                        ))}
                        {university.alumni.length > 10 && (
                          <div
                            style={{
                              textAlign: 'center',
                              color: 'var(--text-tertiary)',
                              fontSize: '11px',
                              marginTop: '8px',
                            }}
                          >
                            +{university.alumni.length - 10} alumni lainnya
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
      <div
        style={{
          marginTop: '16px',
          padding: '12px',
          background: 'var(--bg-tertiary)',
          borderRadius: '8px',
          fontSize: '13px',
          color: 'var(--text-secondary)',
        }}
      >
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                width: '16px',
                height: '16px',
                borderRadius: '50%',
                background: '#10b981',
                border: '2px solid white',
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
              }}
            />
            <span>PTN</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                width: '16px',
                height: '16px',
                borderRadius: '50%',
                background: '#8b5cf6',
                border: '2px solid white',
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
              }}
            />
            <span>PTS</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                width: '16px',
                height: '16px',
                borderRadius: '50%',
                background: '#ec4899',
                border: '2px solid white',
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
              }}
            />
            <span>Kedinasan</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                width: '16px',
                height: '16px',
                borderRadius: '50%',
                background: '#3388ff',
                border: '2px solid white',
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
              }}
            />
            <span>Lainnya</span>
          </div>
        </div>
        <div
          style={{
            marginTop: '8px',
            fontSize: '12px',
            color: 'var(--text-tertiary)',
          }}
        >
          Ukuran marker menunjukkan jumlah alumni di universitas tersebut
        </div>
      </div>
    </div>
  );
};

export default InteractiveAlumniMap;



