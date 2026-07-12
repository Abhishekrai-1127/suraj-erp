import React from "react";

export function Button({ children, onClick }) {
  return (
    <button onClick={onClick} style={{ padding: "8px 16px", borderRadius: "4px" }}>
      {children}
    </button>
  );
}
