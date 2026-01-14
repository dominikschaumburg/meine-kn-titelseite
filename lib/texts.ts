/**
 * Text-Helper für Du/Sie-Ansprache
 * Verwendung: getText(appConfig, 'key')
 */

export interface TextKeys {
  // Intro
  'intro.headline': string
  'intro.step1': string
  'intro.step2': string
  'intro.step3': string
  'intro.privacy': string

  // Crop
  'crop.instruction': string

  // Preview - DOI not completed
  'preview.doi.instruction': string
  'preview.doi.button': string

  // Preview - DOI completed
  'preview.completed.message': string
  'preview.completed.share': string

  // Action ended
  'actionEnded.message': string
}

const texts = {
  du: {
    'intro.headline': 'Bring dein Selfie auf die KN-Titelseite',
    'intro.step1': 'Nimm ein Selfie auf. Halte dein Smartphone am besten im Querformat.',
    'intro.step2': 'Registriere dich, bestätige deine E-Mail und schalte deine Titelseite frei',
    'intro.step3': 'Speichere und teile deine Titelseite.',
    'intro.privacy': 'Fotos bleiben auf deinem Gerät. Keine Speicherung, keine Veröffentlichung.',

    'crop.instruction': 'Ziehe den Rahmen, um dein Foto passend zuzuschneiden.',

    'preview.doi.instruction': 'Klicke auf den Button unten, um am Gewinnspiel teilzunehmen und deine personalisierte Titelseite in voller Auflösung zu erhalten.',
    'preview.doi.button': 'Am Gewinnspiel teilnehmen & Titelseite freischalten',

    'preview.completed.message': 'Du kannst das Bild jetzt speichern und teilen.',
    'preview.completed.share': 'Wenn du magst, teile deine Titelseite gerne auf Social Media und markiere',

    'actionEnded.message': 'Vielen Dank für dein Interesse!',
  },
  sie: {
    'intro.headline': 'Bringen Sie Ihr Selfie auf die KN-Titelseite',
    'intro.step1': 'Nehmen Sie ein Selfie auf. Halten Sie Ihr Smartphone am besten im Querformat.',
    'intro.step2': 'Registrieren Sie sich, bestätigen Sie Ihre E-Mail und schalten Sie Ihre Titelseite frei',
    'intro.step3': 'Speichern und teilen Sie Ihre Titelseite.',
    'intro.privacy': 'Fotos bleiben auf Ihrem Gerät. Keine Speicherung, keine Veröffentlichung.',

    'crop.instruction': 'Ziehen Sie den Rahmen, um Ihr Foto passend zuzuschneiden.',

    'preview.doi.instruction': 'Klicken Sie auf den Button unten, um am Gewinnspiel teilzunehmen und Ihre personalisierte Titelseite in voller Auflösung zu erhalten.',
    'preview.doi.button': 'Am Gewinnspiel teilnehmen & Titelseite freischalten',

    'preview.completed.message': 'Sie können das Bild jetzt speichern und teilen.',
    'preview.completed.share': 'Wenn Sie möchten, teilen Sie Ihre Titelseite gerne auf Social Media und markieren Sie',

    'actionEnded.message': 'Vielen Dank für Ihr Interesse!',
  }
}

export function getText(config: any, key: keyof TextKeys): string {
  const formal = config?.whiteLabel?.formalAddress || false
  const textSet = formal ? texts.sie : texts.du
  return textSet[key] || key
}
