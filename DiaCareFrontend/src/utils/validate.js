const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const LICENSE_RE = /^[A-Za-z0-9\-/]{4,20}$/
const NAME_RE = /^[A-Za-z\s'-]{2,60}$/
const PHONE_RE = /^[+0-9\s()-]{7,20}$/

export const validateLogin = ({ email, password }) => {
  const errors = {}
  if (!email.trim()) errors.email = 'Email or username is required'
  if (!password.trim()) errors.password = 'Password is required'
  return errors
}

export const validateRegister = (form, isDoctor, doctor, role = 'PATIENT') => {
  const {
    name,
    email,
    password,
    confirmPassword,
    dateOfBirth,
    phoneNumber,
    diabetesType,
    hasAllergies,
    allergyDetails,
    preferredDoctorPublicId,
  } = form
  const errors = {}

  if (!name.trim()) errors.name = 'Full name is required'
  else if (!NAME_RE.test(name)) errors.name = 'Name can only contain letters, spaces, hyphens'
  else if (name.trim().length < 2) errors.name = 'Name must be at least 2 characters'

  if (!email.trim()) errors.email = 'Email is required'
  else if (!EMAIL_RE.test(email)) errors.email = 'Enter a valid email address'

  if (!password.trim()) errors.password = 'Password is required'
  else if (password.length < 8) errors.password = 'Password must be at least 8 characters'
  else if (!/[A-Z]/.test(password)) errors.password = 'Password must contain at least one uppercase letter'
  else if (!/[0-9]/.test(password)) errors.password = 'Password must contain at least one number'

  if (!confirmPassword.trim()) errors.confirmPassword = 'Please confirm your password'
  else if (confirmPassword !== password) errors.confirmPassword = 'Passwords do not match'

  if (role === 'PATIENT') {
    if (!phoneNumber.trim()) errors.phoneNumber = 'Telephone number is required'
    else if (!PHONE_RE.test(phoneNumber.trim())) errors.phoneNumber = 'Enter a valid telephone number'

    if (!dateOfBirth) errors.dateOfBirth = 'Date of birth is required'
    if (!diabetesType) errors.diabetesType = 'Please select diabetes type'
    if (!preferredDoctorPublicId) errors.preferredDoctorPublicId = 'Please choose a doctor'
    if (hasAllergies === 'YES' && !allergyDetails.trim()) errors.allergyDetails = 'Please describe your allergy'
  }

  if (isDoctor) {
    if (!doctor.licenseNumber.trim()) errors.licenseNumber = 'License number is required'
    else if (!LICENSE_RE.test(doctor.licenseNumber)) {
      errors.licenseNumber = 'Invalid format - use letters, numbers, hyphens only (4-20 chars)'
    }

    if (!doctor.specialization) errors.specialization = 'Please select a specialization'

    if (!doctor.hospital.trim()) errors.hospital = 'Hospital or clinic name is required'
    else if (doctor.hospital.trim().length < 3) errors.hospital = 'Enter a valid hospital or clinic name'
  }

  return errors
}
