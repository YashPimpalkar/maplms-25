import React, { useState } from "react";
import { Menu, MenuItem, MenuItems } from "@headlessui/react";
import { FiSettings, FiLogOut, FiUser, FiMail } from "react-icons/fi";
import clsx from "clsx";
import { NavLink, useNavigate } from "react-router-dom";

const ProfileDropdown = ({ email, onSignOut }) => {
  return (
    <div className="px-4 py-2">
      <NavLink
        onClick={onSignOut}
        className="flex items-center gap-2 mt-2 w-full rounded-md bg-red-600 px-3 py-2 text-sm text-white hover:bg-red-700 transition-colors duration-200"
      >
        <FiLogOut />
        Sign Out
      </NavLink>
    </div>
  );
};

const UserMenu = ({ isLoggedIn, email }) => {
  const [isTruncated, setIsTruncated] = useState(true);
  const navigate = useNavigate();

  const toggleTruncate = () => {
    setIsTruncated(!isTruncated);
  };

  const handleSignOut = () => {
    navigate("/");
    localStorage.clear();
    window.location.reload();
  };

  return (
    <MenuItems className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white py-2 shadow-xl ring-1 ring-black ring-opacity-5 focus:outline-none divide-y divide-gray-100">
      {isLoggedIn ? (
        <>
          <div className="px-4 py-3">
            <p className="text-sm font-medium text-gray-900">Account Dashboard</p>
            <div 
              className="text-sm text-gray-600 mt-1 cursor-pointer flex items-center gap-2 hover:text-blue-600"
              onClick={toggleTruncate}
            >
              <FiMail className="text-blue-500" />
              {email}
            </div>
          </div>
          
          <div className="py-1">

            
            <MenuItem>
              {() => (
                <ProfileDropdown email={email} onSignOut={handleSignOut} />
              )}
            </MenuItem>
          </div>
        </>
      ) : (
        <>
          <div className="px-4 py-3">
            <p className="text-sm font-medium text-gray-900">Welcome to MapLMS</p>
          </div>
          
          <div className="py-1">
            <MenuItem>
              {({ active }) => (
                <a
                  href="/"
                  className={clsx(
                    active ? "bg-gray-100 text-gray-900" : "text-gray-700",
                    "flex items-center gap-2 px-4 py-2 text-sm hover:text-blue-600 transition-colors duration-200"
                  )}
                >
                  <FiUser className="text-blue-500" />
                  Sign In
                </a>
              )}
            </MenuItem>
            {/* <MenuItem>
              {({ active }) => (
                <a
                  href="/register"
                  className={clsx(
                    active ? "bg-gray-100 text-gray-900" : "text-gray-700",
                    "flex items-center gap-2 px-4 py-2 text-sm hover:text-blue-600 transition-colors duration-200"
                  )}
                >
                  <FiUser className="text-green-500" />
                  Create Account
                </a>
              )}
            </MenuItem> */}
          </div>
        </>
      )}
    </MenuItems>
  );
};

export default UserMenu;