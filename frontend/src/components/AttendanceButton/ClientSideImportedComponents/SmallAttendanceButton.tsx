const SmallAttendanceButton = () => {
    return (
        <div className="flex items-center justify-center w-8 h-8 bg-gray-200 rounded-full">
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            >
                <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
                <path d="M12 22V12"></path>
                <path d="M5.45 9.09L12 12l6.55-2.91"></path>
            </svg>
        </div>
    );
}