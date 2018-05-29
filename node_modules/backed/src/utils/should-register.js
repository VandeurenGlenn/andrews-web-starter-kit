const shouldRegister = name => {
  return customElements.get(name) ? false : true;
}

export default shouldRegister;
