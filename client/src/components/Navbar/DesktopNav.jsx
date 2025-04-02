import React from "react";
import { Menu } from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import clsx from "clsx"; // For conditional class names
import { NavLink, useLocation } from "react-router-dom";

const DesktopNav = ({ navigation }) => {
  const location = useLocation();

  return (
    <div className="hidden sm:ml-6 sm:block">
      <div className="flex space-x-4">
        {navigation.map((item) => {
          // Determine if the current location matches the item's to or any of its submenus
          const isCurrent =
            item.to === location.pathname ||
            (item.submenus &&
              item.submenus.some((submenu) => submenu.to === location.pathname));

          return item.submenus ? (
            <Menu key={item.name} as="div" className="relative">
              <Menu.Button
                className={clsx(
                  isCurrent
                    ? "bg-gray-900 text-white"
                    : "text-gray-300 hover:bg-gray-700 hover:text-white",
                  "rounded-md px-3 py-2 text-sm font-medium flex items-center"
                )}
              >
                {item.name}
                <ChevronDownIcon
                  className="ml-1 h-4 w-4 text-gray-400 group-hover:text-white"
                  aria-hidden="true"
                />
              </Menu.Button>

              <Menu.Items className="absolute right-0 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 z-50">
                {item.submenus.map((submenu) => (
                  <Menu.Item key={submenu.name}>
                    {({ active }) => (
                      <NavLink
                        to={submenu.to}
                        className={clsx(
                          active ? "bg-gray-100" : "",
                          "block px-4 py-2 text-sm text-gray-700"
                        )}
                      >
                        {submenu.name}
                      </NavLink>
                    )}
                  </Menu.Item>
                ))}
              </Menu.Items>
            </Menu>
          ) : (
            <NavLink
              key={item.name}
              to={item.to}
              aria-current={isCurrent ? "page" : undefined}
              className={clsx(
                isCurrent
                  ? "bg-gray-900 text-white"
                  : "text-gray-300 hover:bg-gray-700 hover:text-white",
                "rounded-md px-3 py-2 text-sm font-medium"
              )}
            >
              {item.name}
            </NavLink>
          );
        })}
      </div>
    </div>
  );
};

export default DesktopNav;
