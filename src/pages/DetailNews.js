import React from 'react';
import { useParams, Link } from 'react-router-dom';
import '../components/styles/DetailNews.css';

// Import Aset Gambar yang relevan
import situ from '../assets/images/situ.jpeg';
import bro from '../assets/images/bro.jpeg';
import malio from '../assets/images/malio.jpeg';
import videoSection from '../assets/videos/video-section.mp4';
import servicesBg from '../assets/images/services-bg.jpg';

// Data statis berita
const newsData = [
    { 
        id: "1", 
        title: "Surga Tersembunyi di Sukabumi, Situ Gunung Lembah Purba.", 
        category: "Destinasi, Wisata Alam",
        image: situ,
        date: "08 Juli 2025",
        content: "Lembah Purba di Sukabumi adalah destinasi wisata alam yang kini tengah viral. Tempat ini menawarkan pemandangan alam yang indah dan suasana yang tenang, cocok untuk liburan keluarga dan pecinta alam. Perjalanan menuju Lembah Purba akan membawa Anda melalui jembatan gantung terpanjang di Asia Tenggara, memberikan pengalaman yang tak terlupakan.",
        author: "Admin Barokah"
    },
    { 
        id: "2", 
        title: "7 Keajaiban Dunia yang berada di Yogyakarta Candi Borobudur", 
        category: "Destinasi, Wisata Jogja",
        image: bro,
        date: "08 Juli 2025",
        content: "Candi Borobudur adalah candi Budha terbesar di dunia yang memiliki nilai sejarah dan budaya yang sangat tinggi. Tempat ini menjadi destinasi wajib bagi wisatawan yang berkunjung ke Yogyakarta. Dengan arsitektur yang megah dan relief-relief yang menceritakan kisah-kisah Budha, Borobudur menawarkan pengalaman spiritual dan edukatif.",
        author: "Admin Barokah"
    },
    { 
        id: "3", 
        title: "Menjelajahi Keindahan malam hari Jogjakarta", 
        category: "Destinasi, Wisata Kuliner",
        image: malio,
        date: "08 Juli 2025",
        content: "Malioboro malam hari menyuguhkan suasana yang hangat dan penuh warna dengan berbagai kuliner khas yang menggoda selera. Tempat ini sangat cocok untuk berjalan-jalan dan menikmati malam di Jogjakarta. Anda bisa menemukan beragam jajanan, suvenir, dan pertunjukan seni jalanan yang menghidupkan suasana.",
        author: "Admin Barokah"
    }
];

const DetailNews = () => {
    const { id } = useParams();
    const newsItem = newsData.find(item => item.id === id);

    if (!newsItem) {
        return <div className="detail-news-page">Berita tidak ditemukan.</div>;
    }

    return (
        <div className="detail-news-page">
            <header className="news-detail-hero" style={{ backgroundImage: `url(${newsItem.image})` }}>
                <div className="header-overlay">
                    <h1 className="news-title">{newsItem.title}</h1>
                </div>
            </header>

            <section className="news-content-section">
                <div className="news-meta">
                    <span>{newsItem.date}</span> • <span>{newsItem.author}</span> • <span>{newsItem.category}</span>
                </div>
                <div className="news-main-content">
                    <p>{newsItem.content}</p>
                </div>
                <Link to="/travel" className="back-button">
                    Kembali ke Travel News
                </Link>
            </section>
        </div>
    );
};

export default DetailNews;
