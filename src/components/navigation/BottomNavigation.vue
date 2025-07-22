<template>
  <v-bottom-navigation color="primary" height="65" grow>
    <v-btn to="/dashboard">
      <v-icon>mdi-home</v-icon>

      <span>Dashboard</span>
    </v-btn>

    <v-btn to="/user/report">
      <v-icon>mdi-human-greeting-proximity</v-icon>

      <span>Reporting</span>
    </v-btn>

    <v-btn to="/settings/account">
      <v-icon>mdi-account</v-icon>

      <span>Settings</span>
    </v-btn>
  </v-bottom-navigation>
</template>
