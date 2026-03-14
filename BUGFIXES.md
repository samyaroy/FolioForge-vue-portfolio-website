# Logical Bug Fixes in PR #6 (Data Upgradation)

The following is a list of **logical bug fixes** identified in [PR #6](https://github.com/samyaroy/FolioForge-vue-portfolio-website/pull/6). These are separate from the data/content changes and address issues where the UI would render incorrectly or show broken elements.

---

## 1. Missing `v-if` guard on Google Scholar link in Footer

**File:** `src/components/Footer/index.vue`

**Bug:** The Google Scholar link in the footer's "Social Links" section was always rendered, even when no Google Scholar URL was provided in the profile data. This resulted in a broken/empty link being displayed.

**Fix:** Added `v-if="google_scholar"` to conditionally render the list item only when a Google Scholar URL exists.

```diff
- <li>
+ <li v-if="google_scholar">
    <a :href="google_scholar" target="_blank">Google Scholar</a>
  </li>
```

---

## 2. Missing `v-if` guard on GitHub link in Contact page

**File:** `src/views/Contact.vue`

**Bug:** The GitHub contact entry was always rendered on the Contact page even when no GitHub URL was configured, showing an empty/broken link row.

**Fix:** Added `v-if="github"` to conditionally render the GitHub section.

```diff
- <div class="flex items-center gap-4 bg-slate-50 px-4 min-h-[72px] py-2">
+ <div v-if="github" class="flex items-center gap-4 bg-slate-50 px-4 min-h-[72px] py-2">
```

---

## 3. Missing `v-if` guard on secondary GitHub link in Contact page

**File:** `src/views/Contact.vue`

**Bug:** The secondary GitHub (github2) contact entry was always rendered even when no secondary GitHub URL was provided.

**Fix:** Added `v-if="github2"` to conditionally render the section.

```diff
- <div class="flex items-center gap-4 bg-slate-50 px-4 min-h-[72px] py-2">
+ <div v-if="github2" class="flex items-center gap-4 bg-slate-50 px-4 min-h-[72px] py-2">
```

---

## 4. Missing `v-if` guard on Kaggle link in Contact page

**File:** `src/views/Contact.vue`

**Bug:** The Kaggle contact entry was always rendered even when no Kaggle URL was provided.

**Fix:** Added `v-if="kaggle"` to conditionally render the section.

```diff
- <div class="flex items-center gap-4 bg-slate-50 px-4 min-h-[72px] py-2">
+ <div v-if="kaggle" class="flex items-center gap-4 bg-slate-50 px-4 min-h-[72px] py-2">
```

---

## 5. Missing `v-if` guard on Google Scholar link in Contact page

**File:** `src/views/Contact.vue`

**Bug:** The Google Scholar contact entry was always rendered even when no Google Scholar URL was provided.

**Fix:** Added `v-if="google_scholar"` to conditionally render the section.

```diff
- <div class="flex items-center gap-4 bg-slate-50 px-4 min-h-[72px] py-2">
+ <div v-if="google_scholar" class="flex items-center gap-4 bg-slate-50 px-4 min-h-[72px] py-2">
```

---

## 6. Missing `v-if` guard on ORCID iD link in Contact page

**File:** `src/views/Contact.vue`

**Bug:** The ORCID iD contact entry was always rendered even when no ORCID ID was provided.

**Fix:** Added `v-if="orchis_id"` to conditionally render the section.

```diff
- <div class="flex items-center gap-4 bg-slate-50 px-4 min-h-[72px] py-2">
+ <div v-if="orchis_id" class="flex items-center gap-4 bg-slate-50 px-4 min-h-[72px] py-2">
```

---

## 7. Missing `v-if` guard on GitHub icon in Hero Section

**File:** `src/views/Home/components/HeroSection.vue`

**Bug:** The GitHub icon link in the hero section's social icons row was always rendered even when no personal GitHub URL was configured, resulting in a non-functional icon link.

**Fix:** Added `v-if="github_personal"` to conditionally render the GitHub icon only when the URL exists.

```diff
- <a :href=github_personal target="_blank"
+ <a v-if="github_personal" :href=github_personal target="_blank"
    class="text-[#0e141b] hover:text-[#1980e6] transition-colors duration-200">
    <v-icon>mdi-github</v-icon>
  </a>
```

---

## 8. Hardcoded Flag Counter widget in Footer

**File:** `src/components/Footer/Index.vue`, `src/components/Footer/index.vue`

**Bug:** The footer contained a hardcoded [Flag Counter](https://info.flagcounter.com) tracking widget tied to a specific user's tracking ID (`Wh9G`). When the portfolio template was reused or forked by other users, this widget would incorrectly track visits for the original user rather than the new owner.

**Fix:** Commented out the hardcoded Flag Counter widget.

```diff
- <div class="pt-4 pb-0">
+ <!-- <div class="pt-4 pb-0">
    <a href="https://info.flagcounter.com/Wh9G"><img
        src="https://s01.flagcounter.com/count2/Wh9G/..."
        alt="Flag Counter" border="0"></a>
- </div>
+ </div> -->
```

---

## 9. Awards section commented out on Home page

**File:** `src/views/Home/index.vue`

**Bug:** The `<Awards />` component was commented out in the Home page template, meaning awards were never displayed to users even when award data was configured in the profile.

**Fix:** Uncommented the Awards component and controlled it via a feature flag (`showHome.showAwards`) in `src/config/featureFlags.js`.

```diff
  <!--Awards Section-->
- <!-- <Awards /> -->
+ <Awards v-if="homeFlags.showAwards" />
```

---

## Summary

| # | Bug | File(s) | Category |
|---|-----|---------|----------|
| 1 | Google Scholar link always shown in Footer | `Footer/index.vue` | Missing conditional rendering |
| 2 | GitHub link always shown in Contact | `Contact.vue` | Missing conditional rendering |
| 3 | Secondary GitHub link always shown in Contact | `Contact.vue` | Missing conditional rendering |
| 4 | Kaggle link always shown in Contact | `Contact.vue` | Missing conditional rendering |
| 5 | Google Scholar link always shown in Contact | `Contact.vue` | Missing conditional rendering |
| 6 | ORCID iD link always shown in Contact | `Contact.vue` | Missing conditional rendering |
| 7 | GitHub icon always shown in Hero Section | `HeroSection.vue` | Missing conditional rendering |
| 8 | Hardcoded Flag Counter widget in Footer | `Footer/Index.vue`, `Footer/index.vue` | Hardcoded user-specific content |
| 9 | Awards section commented out | `Home/index.vue` | Hidden feature |
