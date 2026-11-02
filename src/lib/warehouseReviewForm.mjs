// Shared by the normal review, WhatsApp and Showcase request UI.
export function warehouseReviewErrors({contact = {}, configuration = {}, showcase = false, projectUse = '', photographyPreference = ''}) {
 const errors = {}
 if (!String(contact.name || '').trim()) errors.name = 'Enter your first name.'
 if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(contact.email || '').trim())) errors.email = 'Enter a valid email address.'
 if (!String(contact.phone || '').trim()) errors.phone = 'Enter your phone number.'
 if (!String(configuration.projectStage || '').trim()) errors.projectStage = 'Choose your project stage.'
 if (!String(configuration.location || '').trim()) errors.location = 'Enter the project town or site area.'
 if (showcase && !String(projectUse).trim()) errors.projectUse = 'Tell us what the building will be used for.'
 if (showcase && !photographyPreference) errors.photographyPreference = 'Select your photography preference.'
 return errors
}
