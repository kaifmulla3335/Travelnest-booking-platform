import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  ArrowUpRight,
  BadgeCheck,
  CalendarClock,
  CalendarDays,
  Clock3,
  MapPin,
  ShieldCheck,
  Star,
  Timer,
  UsersRound,
} from 'lucide-react';

const getImage = (pkg) => pkg?.imageUrl || pkg?.image || null;
const getBg = (pkg) => pkg?.bg || 'from-sky-300 to-sky-500';
const getEmoji = (pkg) => pkg?.emoji || '✈️';

const formatDate = (date, includeYear = false) =>
  new Date(date).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    ...(includeYear && { year: 'numeric' }),
  });

const getDaysLeft = (tourStartDate) => {
  if (!tourStartDate) return null;
  return Math.ceil((new Date(tourStartDate) - new Date()) / (1000 * 60 * 60 * 24));
};

const TripFact = ({ icon: Icon, label, value, wide = false }) => (
  <div className={`min-w-0 rounded-xl border border-sky-100 bg-[#EAF7FF]/65 px-3 py-2.5 ${wide ? 'col-span-2' : ''}`}>
    <div className="mb-1 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
      <Icon size={13} strokeWidth={1.8} className="shrink-0 text-sky-600" aria-hidden="true" />
      <span>{label}</span>
    </div>
    <div className="break-words text-xs font-semibold leading-snug text-[#0B1728]">{value}</div>
  </div>
);

const PackageCard = ({ pkg }) => {
  const navigate = useNavigate();
  const [imgError, setImgError] = useState(false);
  const image = getImage(pkg);
  const daysLeft = getDaysLeft(pkg.tourStartDate);
  const bookingClosed = daysLeft !== null && daysLeft < 7;
  const bookingDeadline = pkg.bookingDeadline && !bookingClosed;
  const openDetails = () => navigate(`/packages/${pkg.id}`);

  const tourDates = pkg.tourStartDate
    ? `${formatDate(pkg.tourStartDate)}${pkg.tourEndDate ? ` – ${formatDate(pkg.tourEndDate, true)}` : ''}`
    : null;

  return (
    <div
      onClick={openDetails}
      onKeyDown={(event) => {
        if (event.target === event.currentTarget && (event.key === 'Enter' || event.key === ' ')) {
          event.preventDefault();
          openDetails();
        }
      }}
      role="link"
      tabIndex={0}
      aria-label={`View details for ${pkg.title}`}
      className="group flex h-full cursor-pointer flex-col overflow-hidden rounded-[1.5rem] border border-sky-100 bg-white shadow-[0_14px_36px_rgba(11,23,40,0.08)] transition-[transform,box-shadow,border-color] duration-300 hover:-translate-y-1 hover:border-sky-200 hover:shadow-[0_20px_42px_rgba(11,23,40,0.14)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-sky-100">
        {!imgError && image ? (
          <img
            src={image}
            alt={pkg.title}
            loading="lazy"
            onError={() => setImgError(true)}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className={`flex h-full w-full items-center justify-center bg-gradient-to-br ${getBg(pkg)}`}>
            <span className="text-6xl drop-shadow-lg">{getEmoji(pkg)}</span>
          </div>
        )}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#0B1728]/25 via-transparent to-[#0B1728]/40" />

        <div className="absolute left-3 top-3 flex items-center gap-1 rounded-full border border-white/30 bg-[#0B1728]/75 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur-sm">
          <Star size={12} className="fill-amber-300 text-amber-300" aria-hidden="true" />
          {pkg.rating}
        </div>
        <span className="absolute right-3 top-3 max-w-[55%] truncate rounded-full border border-white/60 bg-white/85 px-3 py-1 text-xs font-semibold text-[#0B1728] backdrop-blur-sm">
          {pkg.category}
        </span>

        {pkg.tourStartDate && (
          <div className="absolute bottom-3 left-3">
            <span className={`inline-flex items-center gap-1.5 rounded-full border border-white/40 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur-sm ${bookingClosed ? 'bg-[#0B1728]/80' : 'bg-emerald-700/85'}`}>
              {bookingClosed ? (
                <><AlertCircle size={12} aria-hidden="true" /> Booking Closed</>
              ) : daysLeft <= 30 ? (
                <><Timer size={12} aria-hidden="true" /> {daysLeft} days left</>
              ) : (
                <><BadgeCheck size={12} aria-hidden="true" /> Booking Open</>
              )}
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <div className="mb-3 flex min-w-0 items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-1.5 text-xs font-semibold text-sky-700">
            <MapPin size={14} strokeWidth={1.8} className="shrink-0" aria-hidden="true" />
            <span className="truncate">{pkg.location}</span>
          </div>
          <ArrowUpRight size={17} strokeWidth={1.8} className="shrink-0 text-sky-600 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" />
        </div>

        <h3 className="mb-4 line-clamp-2 min-h-[3.1rem] font-display text-lg font-bold leading-snug text-[#0B1728]">
          {pkg.title}
        </h3>

        <div className="grid grid-cols-2 gap-2">
          <TripFact icon={Clock3} label="Duration" value={pkg.duration} />
          <TripFact icon={UsersRound} label="Available" value={`${pkg.availableSlots ?? pkg.slots ?? 0} slots`} />
          {tourDates && (
            <TripFact icon={CalendarDays} label="Travel dates" value={tourDates} wide={!bookingDeadline} />
          )}
          {bookingDeadline && (
            <TripFact icon={CalendarClock} label="Book by" value={formatDate(pkg.bookingDeadline)} wide={!tourDates} />
          )}
        </div>

        {pkg.tourStartDate && !bookingClosed && (
          <div className="mt-3 flex items-center justify-center gap-1.5 rounded-lg bg-emerald-50 px-2.5 py-2 text-center text-[11px] font-medium text-emerald-800">
            <ShieldCheck size={14} className="shrink-0" aria-hidden="true" />
            Free cancel 7+ days before tour
          </div>
        )}

        <div className="mt-auto flex items-end justify-between gap-2 border-t border-sky-100 pt-4">
          <div className="min-w-0">
            <div className="font-display text-xl font-bold leading-none text-sky-700">
              ₹{Number(pkg.price).toLocaleString('en-IN')}
            </div>
            <div className="mt-1 text-[11px] text-slate-500">per person</div>
          </div>
          <button
            onClick={(event) => { event.stopPropagation(); openDetails(); }}
            disabled={bookingClosed}
            className={`min-h-10 shrink-0 rounded-full px-3 text-xs font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600 sm:px-4 ${bookingClosed ? 'cursor-not-allowed bg-slate-100 text-slate-500' : 'bg-sky-600 text-white hover:bg-sky-700'}`}
          >
            {bookingClosed ? 'Closed' : 'View Details'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PackageCard;
