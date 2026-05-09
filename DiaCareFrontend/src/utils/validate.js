const EMAIL_RE   = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const LICENSE_RE = /^[A-Za-z0-9\-\/]{4,20}$/
const NAME_RE    = /^[A-Za-zÀ-ÿ\s'\-]{2,60}$/

export const validateLogin = ({ email, password }) => {
  const errors = {}
  if (!email.trim())               errors.email    = 'Email is required'
  else if (!EMAIL_RE.test(email))  errors.email    = 'Enter a valid email address'
  if (!password.trim())            errors.password = 'Password is required'
  return errors
}

export const validateRegister = ({ name, email, password, confirmPassword }, isDoctor, doctor) => {
  const errors = {}

  if (!name.trim())                errors.name     = 'Full name is required'
  else if (!NAME_RE.test(name))    errors.name     = 'Name can only contain letters, spaces, hyphens'
  else if (name.trim().length < 2) errors.name     = 'Name must be at least 2 characters'

  if (!email.trim())               errors.email    = 'Email is required'
  else if (!EMAIL_RE.test(email))  errors.email    = 'Enter a valid email address'

  if (!password.trim())                    errors.password = 'Password is required'
  else if (password.length < 8)            errors.password = 'Password must be at least 8 characters'
  else if (!/[A-Z]/.test(password))        errors.password = 'Password must contain at least one uppercase letter'
  else if (!/[0-9]/.test(password))        errors.password = 'Password must contain at least one number'

  if (!confirmPassword.trim())                      errors.confirmPassword = 'Please confirm your password'
  else if (confirmPassword !== password)            errors.confirmPassword = 'Passwords do not match'

  if (isDoctor) {
    if (!doctor.licenseNumber.trim())
      errors.licenseNumber = 'License number is required'
    else if (!LICENSE_RE.test(doctor.licenseNumber))
      errors.licenseNumber = 'Invalid format — use letters, numbers, hyphens only (4–20 chars)'

    if (!doctor.specialization)
      errors.specialization = 'Please select a specialization'

    if (!doctor.hospital.trim())
      errors.hospital = 'Hospital or clinic name is required'
    else if (doctor.hospital.trim().length < 3)
      errors.hospital = 'Enter a valid hospital or clinic name'
  }

  return errors
}
