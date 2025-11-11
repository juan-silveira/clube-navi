import React, { Fragment } from "react";
import Icon from "@/components/ui/Icon";
import useDarkmode from "@/hooks/useDarkMode";

const Select = ({
  label,
  placeholder = "Select Option",
  classLabel = "form-label",
  className = "",
  classGroup = "",
  register,
  name,
  readonly,
  value,
  error,
  icon,
  disabled,
  id,
  horizontal,
  validate,
  msgTooltip,
  description,
  onChange,
  options,
  defaultValue,

  size,
  ...rest
}) => {
  const [isDark] = useDarkmode();
  options = options || Array(3).fill("option");

  // Classes de input baseadas no tema
  const inputClasses = isDark
    ? "!bg-slate-700 !border-slate-600 !text-white placeholder-slate-400"
    : "!bg-white !border-slate-300 !text-slate-900 placeholder-slate-400";

  const optionClasses = isDark
    ? "!bg-slate-700 !text-white"
    : "!bg-white !text-slate-900";

  return (
    <div
      className={`fromGroup  ${error ? "has-error" : ""}  ${
        horizontal ? "flex" : ""
      }  ${validate ? "is-valid" : ""} `}
    >
      {label && (
        <label
          htmlFor={id}
          className={`block capitalize ${
            classLabel === "form-label"
              ? (isDark ? "text-slate-200" : "text-slate-700")
              : classLabel
          }  ${
            horizontal ? "flex-0 mr-6 md:w-[100px] w-[60px] break-words" : ""
          }`}
        >
          {label}
        </label>
      )}
      <div className={`relative ${horizontal ? "flex-1" : ""}`}>
        {name && (
          <select
            onChange={onChange}
            {...register(name)}
            {...rest}
            className={`${
              error ? " has-error" : " "
            } form-control py-2 pr-10 appearance-none ${inputClasses} ${className}  `}
            placeholder={placeholder}
            readOnly={readonly}
            disabled={disabled}
            id={id}
            value={value}
            size={size}
            defaultValue={defaultValue}
          >
            <option value="" disabled className={optionClasses}>
              {placeholder}
            </option>
            {options.map((option, i) => (
              <Fragment key={i}>
                {typeof option === 'object' && option !== null ? (
                  <option key={i} value={option.value || ''} className={optionClasses}>
                    {option.label || ''}
                  </option>
                ) : (
                  <option key={i} value={option} className={optionClasses}>
                    {option}
                  </option>
                )}
              </Fragment>
            ))}
          </select>
        )}
        {!name && (
          <select
            onChange={onChange}
            className={`${
              error ? " has-error" : " "
            } form-control py-2 pr-10 appearance-none ${inputClasses} ${className}  `}
            placeholder={placeholder}
            readOnly={readonly}
            disabled={disabled}
            id={id}
            value={value}
            size={size}
            defaultValue={defaultValue}
          >
            <option value="" disabled className={optionClasses}>
              {placeholder}
            </option>
            {options.map((option, i) => (
              <Fragment key={i}>
                {typeof option === 'object' && option !== null ? (
                  <option key={i} value={option.value || ''} className={optionClasses}>
                    {option.label || ''}
                  </option>
                ) : (
                  <option key={i} value={option} className={optionClasses}>
                    {option}
                  </option>
                )}
              </Fragment>
            ))}
          </select>
        )}

        {/* icon */}
        <div className="flex text-xl absolute right-3 top-1/2 -translate-y-1/2 space-x-1 pointer-events-none">
          <span className="inline-block text-slate-900 dark:text-slate-300">
            <Icon icon="heroicons:chevron-down" />
          </span>
          {error && (
            <span className="text-danger-500">
              <Icon icon="heroicons-outline:information-circle" />
            </span>
          )}
          {validate && (
            <span className="text-success-500">
              <Icon icon="bi:check-lg" />
            </span>
          )}
        </div>
      </div>
      {/* error and success message*/}
      {error && (
        <div
          className={` mt-2 ${
            msgTooltip
              ? " inline-block bg-danger-500 text-white text-[10px] px-2 py-1 rounded"
              : " text-danger-500 block text-sm"
          }`}
        >
          {error.message}
        </div>
      )}
      {/* validated and success message*/}
      {validate && (
        <div
          className={` mt-2 ${
            msgTooltip
              ? " inline-block bg-success-500 text-white text-[10px] px-2 py-1 rounded"
              : " text-success-500 block text-sm"
          }`}
        >
          {validate}
        </div>
      )}
      {/* only description */}
      {description && <span className="input-description">{description}</span>}
    </div>
  );
};

export default Select;
