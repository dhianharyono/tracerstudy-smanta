import React from 'react';
import { FaCrown, FaTimes, FaArrowRight, FaUniversity } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

interface MentorshipPromoCardProps {
    profile: any;
    onClose: () => void;
}

const MentorshipPromoCard: React.FC<MentorshipPromoCardProps> = ({ profile, onClose }) => {
    const navigate = useNavigate();

    // Check if user has university data
    const hasUniversityData = !!profile?.university?.name;
    // Check if user is already a mentor
    const isMentor = !!profile?.isMentor;

    if (!hasUniversityData || isMentor) {
        return null;
    }

    const handleClick = () => {
        navigate('/alumni/profile');
    };

    const handleClose = (e: React.MouseEvent) => {
        e.stopPropagation();
        onClose();
    };

    return (
        <div
            onClick={handleClick}
            className="relative mb-6 cursor-pointer group overflow-hidden rounded-2xl border border-indigo-500/30 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-800 p-6 text-white shadow-lg transition-all duration-300 hover:shadow-indigo-500/25 hover:scale-[1.01]"
        >
            {/* Background decorations */}
            <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-3xl transition-all group-hover:bg-white/20" />
            <div className="absolute -left-10 -bottom-10 h-32 w-32 rounded-full bg-blue-500/20 blur-2xl" />

            {/* Close Button */}
            <button
                onClick={handleClose}
                className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white/80 transition-colors hover:bg-white/20 hover:text-white"
                title="Tutup info ini"
            >
                <FaTimes />
            </button>

            <div className="relative z-0 flex flex-col md:flex-row items-center gap-6">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/20 shadow-inner backdrop-blur-sm">
                    <FaCrown className="text-3xl text-amber-300 drop-shadow-md" />
                </div>

                <div className="flex-1 text-center md:text-left">
                    <div className="mb-2 flex items-center justify-center md:justify-start gap-2">
                        <span className="rounded-full bg-amber-400/20 px-3 py-0.5 text-xs font-bold text-amber-300 border border-amber-400/30">
                            Fitur Baru
                        </span>
                        <span className="flex items-center gap-1 text-xs text-indigo-200">
                            <FaUniversity className="text-[10px]" />
                            Syarat Terpenuhi
                        </span>
                    </div>
                    <h3 className="mb-1 text-xl font-bold text-white">
                        Jadilah Mentor untuk Adik Kelas!
                    </h3>
                    <p className="text-sm text-indigo-100/90 leading-relaxed max-w-2xl">
                        Anda telah melengkapi data perguruan tinggi. Bagikan pengalaman Anda dan bantu siswa SMANTA menentukan masa depan mereka. Aktifkan status mentor di profil Anda sekarang.
                    </p>
                </div>

                <div className="shrink-0">
                    <div className="flex items-center gap-2 rounded-xl bg-white text-indigo-600 px-5 py-3 font-bold text-sm shadow-md group-hover:translate-x-1 transition-transform">
                        Ke Profil Saya <FaArrowRight />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MentorshipPromoCard;
