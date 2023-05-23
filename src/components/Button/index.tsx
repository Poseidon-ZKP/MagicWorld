export interface IButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  isError?: boolean;
  isSuccess?: boolean;
  isDisabled?: boolean;
}

function Button({
  children,
  isSuccess = false,
  isLoading = false,
  isError = false,
  isDisabled,
  ...otherProps
}: IButtonProps) {
  if (isSuccess) {
    return (
      <button
        className={`flex justify-center shrink-0 items-center bg-amber-800 text-white  py-1 px-2 rounded-md ${
          isError
            ? '!border-[#e23636]  !bg-[#e23636]'
            : '!border-slate-200 !bg-amber-800'
        }`}
        disabled
        {...otherProps}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-4 h-4"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M4.5 12.75l6 6 9-13.5"
          />
        </svg>
      </button>
    );
  }

  return (
    <button
      className={`flex shrink-0 justify-center items-center  text-white  py-1 px-2 rounded-md border-slate-200  bg-amber-800 ${
        isError ? '!border-rose-700  !bg-rose-700' : ''
      } ${isDisabled ? '!border-slate-700  !bg-slate-700' : ''}`}
      disabled={isLoading || isDisabled}
      {...otherProps}
    >
      {isLoading && (
        <svg
          className={`animate-spin -ml-1 mr-3  w-4 h-4 text-white`}
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      )}
      {isError ? 'Retry' : children}
    </button>
  );
}

export default Button;
