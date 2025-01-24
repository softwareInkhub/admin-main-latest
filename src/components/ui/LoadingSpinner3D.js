'use client';
import { Dialog } from '@headlessui/react';

export default function LoadingSpinner3D({ isOpen }) {
  return (
    <Dialog
      open={isOpen}
      onClose={() => {}}
      className="relative z-50"
    >
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" aria-hidden="true" />

      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto rounded-2xl bg-[#1e2532]/90 p-8 shadow-xl">
          <div className="flex flex-col items-center space-y-6">
            <div className="w-16 h-16">
              <div className="w-full h-full animate-spin">
                <div className="w-full h-full rounded bg-blue-600 animate-pulse" 
                     style={{
                       animation: 'cube-rotate 2s infinite linear',
                       transformStyle: 'preserve-3d'
                     }}
                />
              </div>
            </div>
            <div className="text-center">
              <Dialog.Title className="text-xl font-medium text-white">
                Creating Account
              </Dialog.Title>
              <p className="mt-2 text-gray-400">
                Please wait while we set up the account...
              </p>
            </div>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
} 