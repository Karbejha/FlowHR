'use client';

import { Menu, Transition } from '@headlessui/react';
import { UserCircleIcon } from '@heroicons/react/24/outline';
import { Fragment } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import Image from 'next/image';

export default function UserDropdown() {
  const { user, logout } = useAuth();

  return (
    <Menu as="div" className="relative ml-3">
      <Menu.Button className="flex items-center rounded-full p-1 text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800">        {user?.avatar ? (
          <div className="relative h-8 w-8">
            <Image
              src={user.avatar}
              alt="User avatar"
              className="rounded-full"
              fill
              sizes="(max-width: 32px) 100vw"
            />
          </div>
        ) : (
          <UserCircleIcon className="h-8 w-8" />
        )}
      </Menu.Button>
      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute right-0 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none dark:bg-gray-800">
          <Menu.Item>
            {({ active }) => (
              <Link
                href="/profile"
                className={`${
                  active ? 'bg-gray-100 dark:bg-gray-700' : ''
                } block px-4 py-2 text-sm text-gray-700 dark:text-gray-200`}
              >
                Profile
              </Link>
            )}
          </Menu.Item>
          <Menu.Item>
            {({ active }) => (
              <button
                onClick={() => logout()}
                className={`${
                  active ? 'bg-gray-100 dark:bg-gray-700' : ''
                } block w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-200`}
              >
                Logout
              </button>
            )}
          </Menu.Item>
        </Menu.Items>
      </Transition>
    </Menu>
  );
}
