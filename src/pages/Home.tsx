import React from 'react';
import { Link } from 'react-router-dom';
import { Terminal, Shield, Globe } from 'lucide-react';
import Button from '../components/ui/Button';

export default function Home() {
  return (
    <div className="bg-white">
      <div className="relative isolate px-6 pt-14 lg:px-8">
        <div className="mx-auto max-w-2xl py-32 sm:py-48 lg:py-56">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
              Secure Local Development with HTTPS
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              Run your local development environments over HTTPS without uploading any code or installing browser extensions.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link to="/register">
                <Button size="lg">Get Started</Button>
              </Link>
              <Link to="/login">
                <Button variant="outline" size="lg">Sign In</Button>
              </Link>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
            <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
              <div className="flex flex-col">
                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900">
                  <Terminal className="h-5 w-5 flex-none text-blue-600" />
                  Simple Setup
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600">
                  <p className="flex-auto">Generate an API key and run a single command to secure your local server.</p>
                </dd>
              </div>
              <div className="flex flex-col">
                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900">
                  <Shield className="h-5 w-5 flex-none text-blue-600" />
                  Secure by Default
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600">
                  <p className="flex-auto">Valid HTTPS certificates and API key authentication keep your development secure.</p>
                </dd>
              </div>
              <div className="flex flex-col">
                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900">
                  <Globe className="h-5 w-5 flex-none text-blue-600" />
                  Local Network Only
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600">
                  <p className="flex-auto">Your development server stays private, accessible only on your local network.</p>
                </dd>
              </div>

            </dl>
            <div className="flex flex-col gap-2 w-60 sm:w-72 text-[10px] sm:text-xs z-50 justify-center">
  <div
    className="error-alert cursor-default flex items-center justify-between w-full h-12 sm:h-14 rounded-lg bg-[#232531] px-[10px]"
  >
    <div className="flex gap-2">
      <div className="text-[#5c93e1] bg-white/5 backdrop-blur-xl p-1 rounded-lg">
      <span className='text-purple-600'>G</span>lop
      </div>
      <div>
        <p className="text-white">Powered by Glop</p>
        <p className="text-gray-500">All rights reserved</p>
      </div>
    </div>
    <button
      className="text-gray-600 hover:bg-white/10 p-1 rounded-md transition-colors ease-linear"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-thumbs-up"><path d="M7 10v12"/><path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2a3.13 3.13 0 0 1 3 3.88Z"/></svg>
    </button>
  </div>
</div>

          </div>
        </div>
      </div>
    </div>
  );
}