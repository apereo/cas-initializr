output "url" {
  value = "https://${azurerm_container_app.cas.latest_revision_fqdn}"
}
