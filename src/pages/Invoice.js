import React, { useState } from 'react';

const Invoice = () => {
  const [selectedPayment, setSelectedPayment] = useState('');
  const [showPaymentMethods, setShowPaymentMethods] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Mock data - in real app this would come from props/state
  const invoiceData = {
    namaPaket: "Paket Wisata Bali Premium",
    harga: 2500000,
    peserta: [
      { nama: "John Doe", telepon: "08123456789" },
      { nama: "Jane Smith", telepon: "08987654321" }
    ],
    emailKontak: "contact@wisata.com",
    totalHarga: 5000000
  };

  const paymentMethods = [
    {
      category: "Bank Transfer",
      methods: [
        { id: "bca", name: "BCA", icon: "🏦", color: "#003d82" },
        { id: "mandiri", name: "Bank Mandiri", icon: "🏛️", color: "#003d6b" },
        { id: "bri", name: "Bank BRI", icon: "🏦", color: "#0066cc" },
        { id: "bni", name: "Bank BNI", icon: "🏛️", color: "#ee7914" },
        { id: "cimb", name: "CIMB Niaga", icon: "🏦", color: "#d32f2f" }
      ]
    },
    {
      category: "E-Wallet",
      methods: [
        { id: "gopay", name: "GoPay", icon: "💚", color: "#00aa13" },
        { id: "ovo", name: "OVO", icon: "💙", color: "#4c3494" },
        { id: "dana", name: "DANA", icon: "💛", color: "#118ee9" },
        { id: "shopeepay", name: "ShopeePay", icon: "🧡", color: "#ee4d2d" },
        { id: "linkaja", name: "LinkAja", icon: "❤️", color: "#e61e2b" }
      ]
    },
    {
      category: "Virtual Account",
      methods: [
        { id: "va_bca", name: "BCA Virtual Account", icon: "🔢", color: "#003d82" },
        { id: "va_mandiri", name: "Mandiri Virtual Account", icon: "🔢", color: "#003d6b" },
        { id: "va_bni", name: "BNI Virtual Account", icon: "🔢", color: "#ee7914" }
      ]
    },
    {
      category: "Credit Card",
      methods: [
        { id: "visa", name: "Visa", icon: "💳", color: "#1a1f71" },
        { id: "mastercard", name: "Mastercard", icon: "💳", color: "#eb001b" },
        { id: "jcb", name: "JCB", icon: "💳", color: "#0e4c96" }
      ]
    }
  ];

  const handlePaymentSelect = (methodId) => {
    setSelectedPayment(methodId);
  };

  const handlePayment = async () => {
    if (!selectedPayment) return;
    
    setIsProcessing(true);
    
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsProcessing(false);
    alert(`Pembayaran melalui ${paymentMethods.flatMap(cat => cat.methods).find(m => m.id === selectedPayment)?.name} sedang diproses!`);
  };

  return (
    <div style={styles.invoicePage}>
      <div style={styles.invoiceContainer}>
        {/* Decorative Background Elements */}
        <div style={styles.backgroundDecoration}></div>
        <div style={styles.backgroundDecoration2}></div>
        
        {/* Header */}
        <div style={styles.invoiceHeader}>
          <h1 style={styles.invoiceTitle}>Invoice Pembayaran</h1>
          <p style={styles.invoiceSubtitle}>
            Terima kasih telah melakukan pemesanan paket wisata premium kami
          </p>
        </div>

        {/* Invoice Details */}
        <div style={styles.invoiceContent}>
          <div style={styles.invoiceSection}>
            <h3 style={styles.sectionTitle}>
              <span style={styles.sectionIcon}>📦</span>
              Informasi Paket
            </h3>
            <div style={styles.sectionContent}>
              <div style={styles.detailRow}>
                <span>Nama Paket:</span>
                <strong>{invoiceData.namaPaket}</strong>
              </div>
              <div style={styles.detailRow}>
                <span>Harga per Orang:</span>
                <strong>{invoiceData.harga.toLocaleString("id-ID", {
                  style: "currency",
                  currency: "IDR",
                  minimumFractionDigits: 0,
                })}</strong>
              </div>
            </div>
          </div>

          <div style={styles.invoiceSection}>
            <h3 style={styles.sectionTitle}>
              <span style={styles.sectionIcon}>👥</span>
              Data Peserta ({invoiceData.peserta.length} orang)
            </h3>
            <div style={styles.sectionContent}>
              {invoiceData.peserta.map((p, index) => (
                <div key={index} style={styles.pesertaItem}>
                  <div style={styles.pesertaInfo}>
                    <span style={styles.pesertaName}>{p.nama}</span>
                    <span style={styles.pesertaTelepon}>{p.telepon}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={styles.invoiceSection}>
            <h3 style={styles.sectionTitle}>
              <span style={styles.sectionIcon}>📧</span>
              Kontak
            </h3>
            <div style={styles.sectionContent}>
              <div style={styles.contactInfo}>
                {invoiceData.emailKontak}
              </div>
            </div>
          </div>

          {/* Total Amount */}
          <div style={styles.totalSection}>
            <div style={styles.totalContent}>
              <span style={styles.totalLabel}>Total Pembayaran</span>
              <span style={styles.totalAmount}>
                {invoiceData.totalHarga.toLocaleString("id-ID", {
                  style: "currency",
                  currency: "IDR",
                  minimumFractionDigits: 0,
                })}
              </span>
            </div>
          </div>

          {/* Payment Methods */}
          <div style={styles.paymentSection}>
            <h3 style={styles.sectionTitle}>
              <span style={styles.sectionIcon}>💳</span>
              Pilih Metode Pembayaran
            </h3>
            
            <div style={styles.paymentMethods}>
              {paymentMethods.map((category, categoryIndex) => (
                <div key={categoryIndex} style={styles.paymentCategory}>
                  <h4 style={styles.categoryTitle}>{category.category}</h4>
                  <div style={styles.methodsGrid}>
                    {category.methods.map((method) => (
                      <div
                        key={method.id}
                        style={{
                          ...styles.paymentMethod,
                          ...(selectedPayment === method.id ? styles.selectedMethod : {}),
                          borderColor: selectedPayment === method.id ? method.color : '#e2e8f0'
                        }}
                        onClick={() => handlePaymentSelect(method.id)}
                      >
                        <div style={styles.methodIcon}>{method.icon}</div>
                        <span style={styles.methodName}>{method.name}</span>
                        {selectedPayment === method.id && (
                          <div style={{...styles.checkIcon, backgroundColor: method.color}}>
                            ✓
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div style={styles.actionButtons}>
            <button 
              style={styles.backButton}
              onClick={() => window.history.back()}
            >
              <span style={styles.buttonIcon}>←</span>
              Kembali
            </button>
            
            <button
              style={{
                ...styles.payButton,
                ...(selectedPayment ? styles.payButtonActive : styles.payButtonDisabled),
                ...(isProcessing ? styles.payButtonProcessing : {})
              }}
              onClick={handlePayment}
              disabled={!selectedPayment || isProcessing}
            >
              {isProcessing ? (
                <>
                  <div style={styles.spinner}></div>
                  Memproses...
                </>
              ) : (
                <>
                  <span style={styles.buttonIcon}>💳</span>
                  Bayar Sekarang
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  invoicePage: {
    display: 'flex',
    justifyContent: 'center',
    padding: '40px 20px',
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  
  invoiceContainer: {
    maxWidth: '900px',
    width: '100%',
    background: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    padding: '40px',
    borderRadius: '24px',
    boxShadow: '0 32px 64px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.05)',
    position: 'relative',
    overflow: 'hidden',
  },

  backgroundDecoration: {
    position: 'absolute',
    top: '-50%',
    right: '-20%',
    width: '400px',
    height: '400px',
    background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
    borderRadius: '50%',
    filter: 'blur(100px)',
    zIndex: 0,
  },

  backgroundDecoration2: {
    position: 'absolute',
    bottom: '-30%',
    left: '-10%',
    width: '300px',
    height: '300px',
    background: 'linear-gradient(135deg, rgba(240, 147, 251, 0.1) 0%, rgba(245, 101, 101, 0.1) 100%)',
    borderRadius: '50%',
    filter: 'blur(80px)',
    zIndex: 0,
  },

  invoiceHeader: {
    textAlign: 'center',
    marginBottom: '40px',
    position: 'relative',
    zIndex: 1,
  },

  invoiceTitle: {
    fontSize: '42px',
    fontWeight: '900',
    marginBottom: '8px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    letterSpacing: '-1px',
  },

  invoiceSubtitle: {
    fontSize: '18px',
    color: '#64748b',
    fontWeight: '500',
    opacity: 0.8,
  },

  invoiceContent: {
    position: 'relative',
    zIndex: 1,
  },

  invoiceSection: {
    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.8) 0%, rgba(255, 255, 255, 0.4) 100%)',
    backdropFilter: 'blur(10px)',
    padding: '28px',
    borderRadius: '20px',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    marginBottom: '24px',
    position: 'relative',
    overflow: 'hidden',
  },

  sectionTitle: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },

  sectionIcon: {
    fontSize: '24px',
  },

  sectionContent: {
    marginLeft: '36px',
  },

  detailRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px',
    padding: '8px 0',
    fontSize: '16px',
    color: '#334155',
  },

  pesertaItem: {
    background: 'rgba(255, 255, 255, 0.6)',
    padding: '16px',
    borderRadius: '12px',
    marginBottom: '12px',
    border: '1px solid rgba(255, 255, 255, 0.4)',
    transition: 'all 0.3s ease',
  },

  pesertaInfo: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  pesertaName: {
    fontWeight: '600',
    color: '#1e293b',
  },

  pesertaTelepon: {
    color: '#64748b',
    fontSize: '14px',
  },

  contactInfo: {
    background: 'rgba(255, 255, 255, 0.6)',
    padding: '16px',
    borderRadius: '12px',
    border: '1px solid rgba(255, 255, 255, 0.4)',
    color: '#334155',
    fontWeight: '500',
  },

  totalSection: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    padding: '24px',
    borderRadius: '20px',
    marginBottom: '32px',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
  },

  totalContent: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  totalLabel: {
    fontSize: '18px',
    fontWeight: '600',
    color: 'white',
  },

  totalAmount: {
    fontSize: '28px',
    fontWeight: '900',
    color: 'white',
  },

  paymentSection: {
    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.6) 100%)',
    backdropFilter: 'blur(15px)',
    padding: '32px',
    borderRadius: '20px',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    marginBottom: '32px',
  },

  paymentMethods: {
    marginLeft: '36px',
  },

  paymentCategory: {
    marginBottom: '28px',
  },

  categoryTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#475569',
    marginBottom: '16px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },

  methodsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '12px',
  },

  paymentMethod: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '16px',
    background: 'rgba(255, 255, 255, 0.8)',
    border: '2px solid #e2e8f0',
    borderRadius: '16px',
    cursor: 'pointer',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    position: 'relative',
    backdropFilter: 'blur(10px)',
  },

  selectedMethod: {
    background: 'rgba(255, 255, 255, 0.95)',
    transform: 'translateY(-2px)',
    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
  },

  methodIcon: {
    fontSize: '24px',
    minWidth: '24px',
  },

  methodName: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#334155',
  },

  checkIcon: {
    position: 'absolute',
    top: '8px',
    right: '8px',
    width: '20px',
    height: '20px',
    borderRadius: '50%',
    color: 'white',
    fontSize: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold',
  },

  actionButtons: {
    display: 'flex',
    gap: '16px',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  backButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '16px 24px',
    background: 'rgba(255, 255, 255, 0.8)',
    border: '2px solid rgba(203, 213, 225, 0.8)',
    borderRadius: '16px',
    color: '#64748b',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    backdropFilter: 'blur(10px)',
  },

  payButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '16px 32px',
    border: 'none',
    borderRadius: '16px',
    fontSize: '16px',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    position: 'relative',
    overflow: 'hidden',
    minWidth: '180px',
    justifyContent: 'center',
  },

  payButtonActive: {
    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    color: 'white',
    boxShadow: '0 10px 25px -5px rgba(16, 185, 129, 0.4)',
  },

  payButtonDisabled: {
    background: '#e2e8f0',
    color: '#94a3b8',
    cursor: 'not-allowed',
  },

  payButtonProcessing: {
    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
  },

  buttonIcon: {
    fontSize: '18px',
  },

  spinner: {
    width: '20px',
    height: '20px',
    border: '2px solid rgba(255, 255, 255, 0.3)',
    borderTop: '2px solid white',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
};

// Add keyframe animation for spinner
const styleSheet = document.createElement("style");
styleSheet.type = "text/css";
styleSheet.innerText = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  @media (max-width: 768px) {
    .invoice-container {
      padding: 24px !important;
      margin: 0 10px !important;
    }
    
    .methodsGrid {
      grid-template-columns: 1fr !important;
    }
    
    .actionButtons {
      flex-direction: column !important;
    }
    
    .actionButtons > * {
      width: 100% !important;
    }
  }
`;
document.head.appendChild(styleSheet);

export default Invoice;