<!-- Marc Millar - S1828600 -->
<template>
  <div id="app">
    <Navbar />
    <div class="container">
      <router-view />
    </div>
    <Footer />
  </div>
</template>

<script>
import Navbar from "@/components/Navbar.vue";
import Footer from "@/components/Footer.vue";

export default {
  //exports the navbar, allowing them used in the app
  name: "App",
  components: {
    Navbar,
    Footer
  }
};
</script>
