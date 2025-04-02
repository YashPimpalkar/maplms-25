import React from "react";
import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
} from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import { NavLink, useNavigate } from "react-router-dom";

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

const MobileNav = ({ navigation }) => {
  const navigate = useNavigate(); // Hook to programmatically navigate

  return (
    <Disclosure.Panel className="sm:hidden g10">
      <div className="space-y-1 px-4 pb-4 pt-3 overflow-y-auto max-h-[calc(100vh-4rem)] bg-blue-800 mb-4"> 
        {navigation.map((item) => (
          <div key={item.name} className="border-b border-blue-700 pb-2 ">
            <Disclosure>
              {({ open }) => (
                <>
                  <DisclosureButton
                    as="div"
                    onClick={() => {
                      if (!item.submenus) {
                        navigate(item.to); // Navigate directly if no submenus
                      }
                    }}
                    className={classNames(
                      "flex justify-between items-center w-full rounded-md px-3 py-2 text-base font-medium text-white hover:bg-blue-700 hover:text-white",
                      open && "bg-blue-700"
                    )}
                  >
                    <span className="flex-1 text-left">{item.name}</span>
                    {item.submenus && (
                      <ChevronDownIcon
                        className={classNames(
                          "h-5 w-5 ml-2 transition-transform",
                          open ? "rotate-180" : "rotate-0"
                        )}
                      />
                    )}
                  </DisclosureButton>
                  {item.submenus && (
                    <DisclosurePanel>
                      <div className="mt-2 space-y-1 rounded-md bg-blue-700 p-3">
                        {item.submenus.map((submenu) => (
                          <NavLink
                            key={submenu.name}
                            to={submenu.to}
                            className={({ isActive }) =>
                              classNames(
                                isActive
                                  ? "bg-blue-600 text-white"
                                  : "text-blue-100 hover:bg-blue-600 hover:text-white",
                                "block rounded-md px-3 py-2 text-sm font-medium"
                              )
                            }
                          >
                            {submenu.name}
                          </NavLink>
                        ))}
                      </div>
                    </DisclosurePanel>
                  )}
                </>
              )}
            </Disclosure>
          </div>
        ))}
      </div>
    </Disclosure.Panel>
  );
};

export default MobileNav;