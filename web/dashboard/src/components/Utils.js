export function capitalizeFirstLetter(str) {
    if (str === undefined || str === "") {
        return ""
    }

    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}
