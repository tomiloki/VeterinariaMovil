import React, { useEffect, useRef } from "react";
import PropTypes from "prop-types";

import "../styles/reservationDropdown.css";

const options = [
  { key: "presencial", label: "Atencion presencial" },
  { key: "movil", label: "Veterinaria movil" },
];

export default function ReservationDropdown({ active, onSelect, onClose }) {
  const menuRef = useRef(null);

  useEffect(() => {
    menuRef.current?.focus();

    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  const handleKeyDown = (event, key) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onSelect(key);
      onClose();
    }

    if (event.key === "Escape") {
      onClose();
    }
  };

  return (
    <div className="reservation-dropdown" role="menu" aria-label="Tipo de cita" tabIndex={-1} ref={menuRef}>
      {options.map(({ key, label }) => (
        <div
          key={key}
          role="menuitemradio"
          aria-checked={active === key}
          tabIndex={0}
          className={`dropdown-item ${active === key ? "active" : ""}`}
          onClick={() => {
            onSelect(key);
            onClose();
          }}
          onKeyDown={(event) => handleKeyDown(event, key)}
        >
          {label}
        </div>
      ))}
    </div>
  );
}

ReservationDropdown.propTypes = {
  active: PropTypes.string,
  onSelect: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

ReservationDropdown.defaultProps = {
  active: "presencial",
};
