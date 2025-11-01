import React from "react";
import Tippy from "@tippyjs/react";
import useDarkmode from "@/hooks/useDarkMode";
import "tippy.js/dist/tippy.css";
import "tippy.js/dist/tippy.css";
import "tippy.js/themes/light.css";
import "tippy.js/themes/light-border.css";
import "tippy.js/animations/shift-away.css";
import "tippy.js/animations/scale-subtle.css";
import "tippy.js/animations/perspective-extreme.css";
import "tippy.js/animations/perspective-subtle.css";
import "tippy.js/animations/perspective.css";
import "tippy.js/animations/scale-extreme.css";
import "tippy.js/animations/scale-subtle.css";
import "tippy.js/animations/scale.css";
import "tippy.js/animations/shift-away-extreme.css";
import "tippy.js/animations/shift-away-subtle.css";
import "tippy.js/animations/shift-away.css";
import "tippy.js/animations/shift-toward-extreme.css";
import "tippy.js/animations/shift-toward-subtle.css";
import "tippy.js/animations/shift-toward.css";

const Tooltip = ({
  children,
  content = "content",
  title,
  className = "btn btn-dark",
  placement = "top",
  arrow = true,
  theme,
  animation = "shift-away",
  trigger = "mouseenter focus",
  interactive = false,
  allowHTML = false,
  maxWidth = 300,
  duration = 200,
  appendTo,
  boundary,
  popperOptions,
  ...props
}) => {
  const [isDark] = useDarkmode();

  // Se theme não foi especificado, usar o tema do sistema
  const tooltipTheme = theme !== undefined ? theme : (isDark ? "dark" : "light");
  // Build Tippy props, only including defined values
  const tippyProps = {
    content,
    placement,
    arrow,
    theme: tooltipTheme,
    animation,
    trigger,
    interactive,
    allowHTML,
    maxWidth,
    duration,
    ...props
  };

  // Only add optional props if they are defined
  if (appendTo !== undefined) tippyProps.appendTo = appendTo;
  if (boundary !== undefined) tippyProps.boundary = boundary;
  if (popperOptions !== undefined) tippyProps.popperOptions = popperOptions;

  return (
    <div className="custom-tippy">
      <Tippy {...tippyProps}>
        {children ? children : <button className={className}>{title}</button>}
      </Tippy>
    </div>
  );
};

export default Tooltip;
