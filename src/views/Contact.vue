<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="container mx-auto px-4">
      <div class="max-w-4xl mx-auto">
        <!-- Page Header -->
        <div class="text-center mb-12">
          <h1 class="text-4xl font-bold text-gray-800 mb-4">Get In Touch</h1>
          <p class="text-xl text-gray-600">Let's discuss your next project or just say hello!</p>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <!-- Contact Form -->
          <div class="bg-white rounded-lg shadow-md p-8">
            <h2 class="text-2xl font-semibold text-gray-800 mb-6">Send a Message</h2>
            
            <v-form @submit.prevent="submitForm" ref="form">
              <div class="space-y-6">
                <v-text-field
                  v-model="form.name"
                  label="Your Name"
                  variant="outlined"
                  :rules="[rules.required]"
                  prepend-inner-icon="mdi-account"
                ></v-text-field>

                <v-text-field
                  v-model="form.email"
                  label="Email Address"
                  variant="outlined"
                  type="email"
                  :rules="[rules.required, rules.email]"
                  prepend-inner-icon="mdi-email"
                ></v-text-field>

                <v-text-field
                  v-model="form.subject"
                  label="Subject"
                  variant="outlined"
                  :rules="[rules.required]"
                  prepend-inner-icon="mdi-format-title"
                ></v-text-field>

                <v-textarea
                  v-model="form.message"
                  label="Message"
                  variant="outlined"
                  rows="6"
                  :rules="[rules.required]"
                  prepend-inner-icon="mdi-message"
                ></v-textarea>

                <v-btn
                  type="submit"
                  color="primary"
                  size="large"
                  class="w-full"
                  :loading="loading"
                  prepend-icon="mdi-send"
                >
                  Send Message
                </v-btn>
              </div>
            </v-form>
          </div>

          <!-- Contact Information -->
          <div class="space-y-6">
            <!-- Contact Info Card -->
            <div class="bg-white rounded-lg shadow-md p-8">
              <h2 class="text-2xl font-semibold text-gray-800 mb-6">Contact Information</h2>
              
              <div class="space-y-4">
                <div class="flex items-center">
                  <v-icon color="primary" class="mr-4">mdi-email</v-icon>
                  <div>
                    <p class="font-semibold text-gray-800">Email</p>
                    <p class="text-gray-600">contact@example.com</p>
                  </div>
                </div>

                <div class="flex items-center">
                  <v-icon color="primary" class="mr-4">mdi-phone</v-icon>
                  <div>
                    <p class="font-semibold text-gray-800">Phone</p>
                    <p class="text-gray-600">+1 (555) 123-4567</p>
                  </div>
                </div>

                <div class="flex items-center">
                  <v-icon color="primary" class="mr-4">mdi-map-marker</v-icon>
                  <div>
                    <p class="font-semibold text-gray-800">Location</p>
                    <p class="text-gray-600">San Francisco, CA</p>
                  </div>
                </div>

                <div class="flex items-center">
                  <v-icon color="primary" class="mr-4">mdi-clock</v-icon>
                  <div>
                    <p class="font-semibold text-gray-800">Business Hours</p>
                    <p class="text-gray-600">Mon - Fri: 9:00 AM - 6:00 PM</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Social Links Card -->
            <div class="bg-white rounded-lg shadow-md p-8">
              <h2 class="text-2xl font-semibold text-gray-800 mb-6">Follow Me</h2>
              
              <div class="grid grid-cols-2 gap-4">
                <v-btn
                  variant="outlined"
                  class="w-full"
                  href="https://github.com"
                  target="_blank"
                  prepend-icon="mdi-github"
                >
                  GitHub
                </v-btn>
                
                <v-btn
                  variant="outlined"
                  class="w-full"
                  href="https://linkedin.com"
                  target="_blank"
                  prepend-icon="mdi-linkedin"
                >
                  LinkedIn
                </v-btn>
                
                <v-btn
                  variant="outlined"
                  class="w-full"
                  href="https://twitter.com"
                  target="_blank"
                  prepend-icon="mdi-twitter"
                >
                  Twitter
                </v-btn>
                
                <v-btn
                  variant="outlined"
                  class="w-full"
                  href="https://dribbble.com"
                  target="_blank"
                  prepend-icon="mdi-dribbble"
                >
                  Dribbble
                </v-btn>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const form = ref({
  name: '',
  email: '',
  subject: '',
  message: ''
})

const loading = ref(false)
const formRef = ref(null)

const rules = {
  required: v => !!v || 'This field is required',
  email: v => /.+@.+\..+/.test(v) || 'Please enter a valid email'
}

const submitForm = async () => {
  loading.value = true
  
  // Simulate form submission
  await new Promise(resolve => setTimeout(resolve, 2000))
  
  // Reset form
  form.value = {
    name: '',
    email: '',
    subject: '',
    message: ''
  }
  
  loading.value = false
  
  // Show success message (you can implement a toast notification here)
  alert('Message sent successfully!')
}
</script>

<style scoped>
/* Custom styles for the contact page */
</style>
