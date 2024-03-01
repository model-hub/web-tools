<template>
  <div style="display: flex; justify-content: center; margin-top: 10rem">
    <h3>{{ vin }}</h3>
  </div>
</template>

<script>
import getRandomVin from '@/assets/js/vin'
export default {
  data() {
    return {
      vin: ''
    }
  },
  created() {
    document.title='VIN'
    this.vin = getRandomVin()
  }
}
</script>

<style scoped></style>
