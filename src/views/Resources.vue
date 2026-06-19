<template>
  <div class="min-h-screen bg-slate-50 py-8">
    <div class="container mx-auto px-4">
      <div class="text-center mb-12">
        <h1 class="text-4xl font-black text-[#0e141b] mb-4 tracking-[-0.033em]">
          Resources
        </h1>
        <p class="content-justify text-lg text-gray-600 max-w-4xl mx-auto">
          A curated collection of useful links, materials, and references related to my academic and professional work.
        </p>
      </div>

      <div class="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
        <section class="bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
          <div class="flex items-center gap-3 mb-3">
            <v-icon class="text-[#1980e6]">mdi-book-open-page-variant</v-icon>
            <h2 class="text-xl font-bold text-[#0e141b]">Learning Materials</h2>
          </div>
          <p class="content-justify text-gray-600">
            Notes, references, and study materials that support teaching, workshops, and independent learning.
          </p>
        </section>

        <section class="bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
          <div class="flex items-center gap-3 mb-3">
            <v-icon class="text-[#1980e6]">mdi-file-document-outline</v-icon>
            <h2 class="text-xl font-bold text-[#0e141b]">Documents</h2>
          </div>
          <p class="content-justify text-gray-600">
            Helpful documents, templates, and supporting files for research, projects, and collaboration.
          </p>
        </section>

        <section class="bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
          <div class="flex items-center gap-3 mb-3">
            <v-icon class="text-[#1980e6]">mdi-link-variant</v-icon>
            <h2 class="text-xl font-bold text-[#0e141b]">Useful Links</h2>
          </div>
          <p class="content-justify text-gray-600">
            Selected external links and platforms that may be useful for students, collaborators, and readers.
          </p>
        </section>

        <section class="bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
          <div class="flex items-center gap-3 mb-3">
            <v-icon class="text-[#1980e6]">mdi-tools</v-icon>
            <h2 class="text-xl font-bold text-[#0e141b]">Tools</h2>
          </div>
          <p class="content-justify text-gray-600">
            Software, utilities, and workflows I find useful for technical, academic, and creative work.
          </p>
        </section>
      </div>
    </div>
  </div>
</template>
