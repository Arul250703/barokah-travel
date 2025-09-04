import React, { useEffect, useState } from "react";
import "../components/styles/Dashboard.css";

const Dashboard = () => {
  const [packages, setPackages] = useState([]);
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    city_id: "",
    trip_code: "",
    description: "",
    price: "",
    imageUrl: "",
    duration: "",
    max_participants: "",
    is_active: 1,
  });
  const [editId, setEditId] = useState(null);

  // 🔹 Fetch data packages
  const fetchPackages = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/packages");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setPackages(Array.isArray(data) ? data : []);
    } catch (e) {
      setError("Gagal memuat data paket.");
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Fetch data cities
  const fetchCities = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/cities");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setCities(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("Gagal memuat data kota:", e);
    }
  };

  useEffect(() => {
    fetchPackages();
    fetchCities();
  }, []);

  // 🔹 Handle input form
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]: type === "checkbox" ? (checked ? 1 : 0) : value,
    });
  };

  // 🔹 Tambah / Update data
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const method = editId ? "PUT" : "POST";
      const url = editId
        ? `http://localhost:5000/api/packages/${editId}`
        : "http://localhost:5000/api/packages";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error("Gagal simpan data");

      setForm({
        name: "",
        city_id: "",
        trip_code: "",
        description: "",
        price: "",
        imageUrl: "",
        duration: "",
        max_participants: "",
        is_active: 1,
      });
      setEditId(null);
      fetchPackages();
    } catch (err) {
      console.error(err);
      setError("Gagal menyimpan data.");
    }
  };

  // 🔹 Hapus data
  const handleDelete = async (id) => {
    if (!window.confirm("Yakin mau hapus paket ini?")) return;
    try {
      await fetch(`http://localhost:5000/api/packages/${id}`, {
        method: "DELETE",
      });
      fetchPackages();
    } catch (err) {
      console.error(err);
      setError("Gagal menghapus data.");
    }
  };

  // 🔹 Edit data
  const handleEdit = (pkg) => {
    setForm({
      name: pkg.name || "",
      city_id: pkg.city_id || "",
      trip_code: pkg.trip_code || "",
      description: pkg.description || "",
      price: pkg.price || "",
      imageUrl: pkg.imageUrl || "",
      duration: pkg.duration || "",
      max_participants: pkg.max_participants || "",
      is_active: pkg.is_active || 1,
    });
    setEditId(pkg.id);

    // Smooth scroll to form
    document.querySelector(".dashboard-form").scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  // 🔹 Cancel edit
  const handleCancelEdit = () => {
    setForm({
      name: "",
      city_id: "",
      trip_code: "",
      description: "",
      price: "",
      imageUrl: "",
      duration: "",
      max_participants: "",
      is_active: 1,
    });
    setEditId(null);
  };

  // 🔹 Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="dashboard-container">
      <h1>📊 Dashboard Packages</h1>

      {/* Form tambah/edit */}
      <form className="dashboard-form" onSubmit={handleSubmit}>
        <input
          type="text"
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="Nama Paket Wisata"
          required
        />

        <select
          name="city_id"
          value={form.city_id}
          onChange={handleChange}
          required
        >
          <option value="">🏙️ Pilih Kota Destinasi</option>
          {cities.map((city) => (
            <option key={city.id} value={city.id}>
              {city.city_name} ({city.city_code})
            </option>
          ))}
        </select>

        <input
          type="text"
          name="trip_code"
          value={form.trip_code}
          onChange={handleChange}
          placeholder="Kode Perjalanan (contoh: JKT001)"
        />

        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          placeholder="Deskripsi detail paket wisata..."
        />

        <input
          type="number"
          name="price"
          value={form.price}
          onChange={handleChange}
          placeholder="Harga dalam Rupiah"
          min="0"
          required
        />

        <input
          type="url"
          name="imageUrl"
          value={form.imageUrl}
          onChange={handleChange}
          placeholder="https://example.com/image.jpg"
        />

        <input
          type="text"
          name="duration"
          value={form.duration}
          onChange={handleChange}
          placeholder="Durasi (contoh: 3 Hari 2 Malam)"
        />

        <input
          type="number"
          name="max_participants"
          value={form.max_participants}
          onChange={handleChange}
          placeholder="Jumlah Peserta Maksimal"
          min="1"
        />

        <label>
          <input
            type="checkbox"
            name="is_active"
            checked={form.is_active === 1}
            onChange={handleChange}
          />
          ✅ Paket Aktif
        </label>

        <div style={{ display: "flex", gap: "10px" }}>
          <button type="submit">
            {editId ? "💾 Update Paket" : "➕ Tambah Paket"}
          </button>
          {editId && (
            <button
              type="button"
              onClick={handleCancelEdit}
              style={{
                background: "linear-gradient(135deg, #6b7280 0%, #4b5563 100%)",
                boxShadow: "0 4px 14px rgba(107, 114, 128, 0.25)",
              }}
            >
              ❌ Batal
            </button>
          )}
        </div>
      </form>

      {loading && (
        <div className="dash-status">⏳ Memuat data paket wisata...</div>
      )}
      {error && <div className="dash-status error">❌ {error}</div>}

      {/* Tabel */}
      {!loading && !error && (
        <div style={{ overflowX: "auto" }}>
          <table className="dashboard-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>📦 Package</th>
                <th>🏙️ City</th>
                <th>🔖 Trip Code</th>
                <th>💰 Price</th>
                <th>⏰ Duration</th>
                <th>👥 Max Participants</th>
                <th>📊 Status</th>
                <th>🖼️ Image</th>
                <th>⚙️ Actions</th>
              </tr>
            </thead>
            <tbody>
              {packages.length === 0 ? (
                <tr>
                  <td colSpan="10" style={{ textAlign: "center" }}>
                    📭 Belum ada paket wisata yang tersedia.
                    <br />
                    <small
                      style={{
                        color: "#94a3b8",
                        marginTop: "8px",
                        display: "block",
                      }}
                    >
                      Silakan tambahkan paket wisata baru menggunakan form di
                      atas.
                    </small>
                  </td>
                </tr>
              ) : (
                packages.map((pkg, index) => (
                  <tr
                    key={pkg.id}
                    style={{
                      animationDelay: `${index * 0.1}s`,
                      animation: "fadeIn 0.5s ease-out forwards",
                    }}
                  >
                    <td>#{pkg.id}</td>
                    <td>
                      <strong style={{ color: "#1e40af" }}>{pkg.name}</strong>
                      {pkg.description && (
                        <div
                          style={{
                            fontSize: "12px",
                            color: "#6b7280",
                            marginTop: "4px",
                            maxWidth: "200px",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {pkg.description}
                        </div>
                      )}
                    </td>
                    <td>
                      <span style={{ fontWeight: "600" }}>{pkg.city_name}</span>
                      <br />
                      <small style={{ color: "#6b7280" }}>
                        ({pkg.city_code})
                      </small>
                    </td>
                    <td>
                      <code
                        style={{
                          background: "#f1f5f9",
                          padding: "4px 8px",
                          borderRadius: "6px",
                          fontSize: "12px",
                          fontWeight: "500",
                        }}
                      >
                        {pkg.trip_code || "—"}
                      </code>
                    </td>
                    <td style={{ fontWeight: "700", color: "#059669" }}>
                      {formatCurrency(pkg.price)}
                    </td>
                    <td>
                      {pkg.duration ? (
                        <span
                          style={{
                            background: "#eff6ff",
                            color: "#1d4ed8",
                            padding: "4px 8px",
                            borderRadius: "6px",
                            fontSize: "12px",
                            fontWeight: "500",
                          }}
                        >
                          {pkg.duration}
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td style={{ textAlign: "center" }}>
                      {pkg.max_participants ? (
                        <span
                          style={{
                            background: "#fef3c7",
                            color: "#d97706",
                            padding: "4px 8px",
                            borderRadius: "6px",
                            fontSize: "12px",
                            fontWeight: "600",
                          }}
                        >
                          {pkg.max_participants} orang
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td>
                      <span
                        style={{
                          display: "inline-block",
                          padding: "4px 10px",
                          borderRadius: "20px",
                          fontSize: "11px",
                          fontWeight: "600",
                          textTransform: "uppercase",
                          letterSpacing: "0.05em",
                          background: pkg.is_active ? "#dcfce7" : "#fee2e2",
                          color: pkg.is_active ? "#166534" : "#dc2626",
                        }}
                      >
                        {pkg.is_active ? "✅ Aktif" : "❌ Nonaktif"}
                      </span>
                    </td>
                    <td>
                      {pkg.imageUrl ? (
                        <img
                          src={pkg.imageUrl}
                          alt={pkg.name}
                          className="dash-thumb"
                          onError={(e) => {
                            e.target.style.display = "none";
                            e.target.nextSibling.style.display = "block";
                          }}
                        />
                      ) : null}
                      <div
                        style={{
                          display: pkg.imageUrl ? "none" : "block",
                          width: "50px",
                          height: "50px",
                          background: "#f1f5f9",
                          borderRadius: "10px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#94a3b8",
                          fontSize: "20px",
                        }}
                      >
                        🖼️
                      </div>
                    </td>
                    <td>
                      <div
                        style={{
                          display: "flex",
                          flexWrap: "wrap",
                          gap: "4px",
                        }}
                      >
                        <button
                          onClick={() => handleEdit(pkg)}
                          title="Edit paket wisata"
                        >
                          ✏️ Edit
                        </button>
                        <button
                          onClick={() => handleDelete(pkg.id)}
                          className="btn-danger"
                          title="Hapus paket wisata"
                        >
                          🗑️ Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Summary Stats */}
      {packages.length > 0 && (
        <div
          style={{
            marginTop: "30px",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "20px",
          }}
        >
          <div
            style={{
              background: "white",
              padding: "20px",
              borderRadius: "12px",
              boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
              textAlign: "center",
              border: "1px solid #f1f5f9",
            }}
          >
            <div style={{ fontSize: "24px", marginBottom: "8px" }}>📦</div>
            <div
              style={{ fontSize: "20px", fontWeight: "700", color: "#1e40af" }}
            >
              {packages.length}
            </div>
            <div style={{ fontSize: "12px", color: "#6b7280" }}>
              Total Paket
            </div>
          </div>

          <div
            style={{
              background: "white",
              padding: "20px",
              borderRadius: "12px",
              boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
              textAlign: "center",
              border: "1px solid #f1f5f9",
            }}
          >
            <div style={{ fontSize: "24px", marginBottom: "8px" }}>✅</div>
            <div
              style={{ fontSize: "20px", fontWeight: "700", color: "#059669" }}
            >
              {packages.filter((pkg) => pkg.is_active).length}
            </div>
            <div style={{ fontSize: "12px", color: "#6b7280" }}>
              Paket Aktif
            </div>
          </div>

          <div
            style={{
              background: "white",
              padding: "20px",
              borderRadius: "12px",
              boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
              textAlign: "center",
              border: "1px solid #f1f5f9",
            }}
          >
            <div style={{ fontSize: "24px", marginBottom: "8px" }}>💰</div>
            <div
              style={{ fontSize: "20px", fontWeight: "700", color: "#d97706" }}
            >
              {formatCurrency(
                packages.reduce(
                  (total, pkg) => total + Number(pkg.price || 0),
                  0
                ) / packages.length || 0
              )}
            </div>
            <div style={{ fontSize: "12px", color: "#6b7280" }}>
              Harga Rata-rata
            </div>
          </div>

          <div
            style={{
              background: "white",
              padding: "20px",
              borderRadius: "12px",
              boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
              textAlign: "center",
              border: "1px solid #f1f5f9",
            }}
          >
            <div style={{ fontSize: "24px", marginBottom: "8px" }}>🏙️</div>
            <div
              style={{ fontSize: "20px", fontWeight: "700", color: "#7c3aed" }}
            >
              {new Set(packages.map((pkg) => pkg.city_id)).size}
            </div>
            <div style={{ fontSize: "12px", color: "#6b7280" }}>
              Kota Destinasi
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
