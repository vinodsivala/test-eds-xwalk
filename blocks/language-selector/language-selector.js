export default function decorate(block) {
  // Read authored fields from Universal Editor
  const fields = [...block.children].map((field) => field.textContent.trim());

  if (fields.length < 23) {
    console.warn('Language Selector: Missing authored fields.');
    return;
  }

  const defaultFlag = fields[0] || '🇺🇸';
  const defaultLanguage = fields[1] || 'EN-US';

  // Read countries and their languages
  const countries = [];

  for (let i = 2; i < 23; i += 3) {
    const country = fields[i];
    const flag = fields[i + 1];

    const languages = fields[i + 2]
      .split(',')
      .map((language) => language.trim())
      .filter(Boolean);

    if (country && languages.length) {
      countries.push({
        country,
        flag,
        languages,
      });
    }
  }

  // Clear original authored content
  block.replaceChildren();

  block.classList.add('language-selector');

  // Main selector button
  const selector = document.createElement('button');

  selector.type = 'button';
  selector.className = 'language-selector-button';

  selector.setAttribute('aria-expanded', 'false');
  selector.setAttribute('aria-haspopup', 'true');

  // Country flag
  const selectedFlag = document.createElement('span');
  selectedFlag.className = 'selected-flag';
  selectedFlag.textContent = defaultFlag;

  // Language code
  const selectedLanguage = document.createElement('span');
  selectedLanguage.className = 'selected-language';
  selectedLanguage.textContent = defaultLanguage;

  // Dropdown arrow
  const arrow = document.createElement('span');
  arrow.className = 'language-arrow';
  arrow.textContent = '⌄';

  selector.append(
    selectedFlag,
    selectedLanguage,
    arrow,
  );

  // Dropdown container
  const dropdown = document.createElement('div');

  dropdown.className = 'language-dropdown';
  dropdown.hidden = true;

  dropdown.setAttribute('aria-label', 'Country and language selection');

  // Build country list
  countries.forEach((country) => {
    const countryItem = document.createElement('div');

    countryItem.className = 'language-country';

    // Country information
    const countryHeader = document.createElement('div');

    countryHeader.className = 'language-country-header';

    const flag = document.createElement('span');

    flag.className = 'country-flag';
    flag.textContent = country.flag;

    const details = document.createElement('div');

    details.className = 'country-details';

    const countryName = document.createElement('div');

    countryName.className = 'country-name';
    countryName.textContent = country.country;

    const languageList = document.createElement('div');

    languageList.className = 'country-languages';

    // Individual language buttons
    country.languages.forEach((language) => {
      const languageButton = document.createElement('button');

      languageButton.type = 'button';
      languageButton.className = 'language-option';
      languageButton.textContent = language;

      languageButton.setAttribute(
        'aria-pressed',
        String(language === defaultLanguage),
      );

      languageButton.addEventListener('click', () => {
        // Update selected language
        selectedLanguage.textContent = language;
        selectedFlag.textContent = country.flag;

        // Update selected state
        dropdown.querySelectorAll('.language-option').forEach((option) => {
          const active = option.textContent === language
            && option.closest('.language-country') === countryItem;

          option.setAttribute('aria-pressed', String(active));
        });

        // Close dropdown
        dropdown.hidden = true;

        selector.setAttribute('aria-expanded', 'false');

        arrow.textContent = '⌄';

        // Save selection
        try {
          localStorage.setItem('wknd-language', language);
          localStorage.setItem('wknd-country', country.country);
        } catch (error) {
          console.warn('Could not save language preference.', error);
        }

        // Notify other website components
        window.dispatchEvent(
          new CustomEvent('wknd:languagechange', {
            detail: {
              country: country.country,
              language,
            },
          }),
        );
      });

      languageList.append(languageButton);
    });

    details.append(countryName, languageList);

    countryHeader.append(flag, details);

    countryItem.append(countryHeader);

    dropdown.append(countryItem);
  });

  // Toggle dropdown
  selector.addEventListener('click', () => {
    const isOpen = !dropdown.hidden;

    dropdown.hidden = isOpen;

    selector.setAttribute(
      'aria-expanded',
      String(!isOpen),
    );

    arrow.textContent = isOpen ? '⌄' : '⌃';
  });

  // Close dropdown when clicking outside
  document.addEventListener('click', (event) => {
    if (!block.contains(event.target)) {
      dropdown.hidden = true;

      selector.setAttribute('aria-expanded', 'false');

      arrow.textContent = '⌄';
    }
  });

  // Close dropdown using Escape
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !dropdown.hidden) {
      dropdown.hidden = true;

      selector.setAttribute('aria-expanded', 'false');

      arrow.textContent = '⌄';

      selector.focus();
    }
  });

  // Add everything to the block
  block.append(selector, dropdown);
}
