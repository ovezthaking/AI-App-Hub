document.addEventListener('click', (e) => {
    const travellersInput = document.getElementById('travellers')

    if (e.target.id === 'plus-btn') {
        travellersInput.value = parseInt(travellersInput.value) + 1
    }

    if (e.target.id === 'minus-btn' && travellersInput.value > 1) {
        travellersInput.value = parseInt(travellersInput.value) - 1
    }
})