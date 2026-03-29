"use client";

interface AccordionArrowProps {
  isOpen: boolean;
}

export const AccordionArrow = ({ isOpen }: AccordionArrowProps) => (
  <div
    style={{
      width: 0,
      height: 0,
      borderLeft: "6px solid transparent",
      borderRight: "6px solid transparent",
      borderTop: "7px solid black",
      transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
      transition: "transform 300ms ease",
      display: "inline-block"
    }}
  />
);