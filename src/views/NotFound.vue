<template>
  <div class="relative flex size-full min-h-screen flex-col bg-slate-50 overflow-x-hidden">
    <div class="layout-container flex h-full grow flex-col">
      <div class="px-8 md:px-16 lg:px-20 flex flex-1 justify-center py-10">
        <div class="layout-content-container flex flex-col w-full max-w-[960px] flex-1 items-center text-center">
          <p class="text-sm font-semibold uppercase tracking-[0.3em] text-[#4e7397]">
            Error 404
          </p>
          <h1 class="mt-3 text-4xl font-black tracking-[-0.033em] text-[#0e141b]">
            This page doesn't exist.
          </h1>
          <p class="mt-4 max-w-[560px] text-slate-600">
            The link may be out of date, or the page may have moved. Everything else is
            still where you left it.
          </p>
          <router-link
            to="/"
            class="mt-8 inline-flex rounded-lg bg-[#1980e6] px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-[#0842a0]"
          >
            Back to home
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>
