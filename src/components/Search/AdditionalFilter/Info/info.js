const isValueString = value => {
  return Object.prototype.toString.call(value) === "[object String]";
};

const isValueArray = value => {
  return Object.prototype.toString.call(value) === "[object Array]";
};

const isValueBoolean = value => {
  return Object.prototype.toString.call(value) === "[object Boolean]";
};

const info = (value, getTranslation) => {
  let result = "";

  if (isValueString(value)) {
    result = value;
  }

  if (isValueArray(value)) {
    if (value.length > 5) {
      result = `${value.length} ${getTranslation("selected")}`;
    } else {
      result = value.reduce((accumulator, currentValue, currentIndex, array) => {
        if (accumulator === "" && currentIndex + 1 !== array.length) {
          return `${currentValue}, `;
        }

        if (currentIndex + 1 === array.length) {
          return `${accumulator}${currentValue}`;
        }

        return `${accumulator}${currentValue}, `;
      }, "");
    }
  }

  if (isValueBoolean(value)) {
    result = value ? `${getTranslation("yes")}` : `${getTranslation("no")}`;
  }

  return result;
};

export { isValueArray, isValueBoolean, isValueString };

export default info;
