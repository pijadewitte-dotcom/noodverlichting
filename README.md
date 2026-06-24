# Noodverlichting Configurator

Een eerste MVP voor installateurs en klanten rond Zemper-noodverlichting:

- ruimtegegevens invullen;
- ja/nee vereisten kiezen;
- inbouw of opbouw selecteren;
- noodverlichtingsarmaturen op een eenvoudige zone-schets plaatsen;
- automatisch plaatsen volgens een projectregel van 1 armatuur per 30 m², met minstens 2 armaturen boven 60 m²;
- budget invullen;
- automatisch een offertevoorstel tonen met `LSR` voor inbouw en `LSM3250LDPW` voor opbouw.

Productbron: https://zemper.com/nl-be/noodverlichting-4/

## Lokaal openen

Open `index.html` rechtstreeks in een browser.

## Deploy op GitHub Pages

1. Ga naar `Settings` > `Pages`.
2. Kies `GitHub Actions` als source.
3. Push naar `main`; de workflow publiceert de site automatisch.

De app is volledig statisch en heeft geen server nodig.
