

const form = document.querySelector( '.form-body' );
const table = document.querySelector( '#table' );
const time = document.querySelector( '#time' );
const saucersSection = document.querySelector( '#saucers .content' );
let customer = {
    table: '',
    time: '',
    order: [],
};

const categories = {
    1: 'Food',
    2: 'Beverages',
    3: 'Desserts',
};

const btnSaveCustomer = document.querySelector( '#save-customer' );
btnSaveCustomer.addEventListener( 'click', saveCustomer );

function saveCustomer() {


    //Revisar si campos vacios
    const emptySpots = [ table.value, time.value ].some( spot => spot === '' );

    if ( emptySpots ) {
        showAlert( 'Please fill all the inputs' );
        return;
    }

    customer = fillCustomer( customer, table.value, time.value );

    //ocultar modal
    const modalForm = document.querySelector( '#modal-form' );
    const modalBootstrap = bootstrap.Modal.getInstance( modalForm );
    modalBootstrap.hide();

    showSection();

    getSources();

}

function fillCustomer( customer, table, time ) {

    customer = { ...customer, table, time, }

    return customer;
}


function showSection() {
    const hiddenSections = document.querySelectorAll( '.d-none' );
    hiddenSections.forEach( section => section.classList.remove( 'd-none' ) );
}

function getSources() {
    const url = 'http://localhost:3000/platillos';

    fetch( url )
        .then( response => response.json() )
        .then( data => fillSaucersSection( data ) )

}

function fillSaucersSection( data ) {

    data = sortObject( data );

    data.forEach( data => {

        const { id, name, category, price } = data;


        const row = document.createElement( 'DIV' );
        row.classList.add( 'row', 'py-3', 'border-top' );

        const nameField = createNameField( name );
        const priceFields = createPriceField( price );
        const categoryFields = createCategoryField( category );
        const divCantidad = createDivCantidad( data );


        row.appendChild( nameField );
        row.appendChild( priceFields );
        row.appendChild( categoryFields );
        row.appendChild( divCantidad );
        saucersSection.appendChild( row );
    } );
}

function sortObject( obj ) {

    let sortable = []
    for ( const id in obj ) {
        sortable.push( obj[ id ] )
    }

    sortable.sort( ( a, b ) => a.category - b.category )

    return sortable
};

function createNameField( name ) {

    const nameField = document.createElement( 'DIV' );
    nameField.classList.add( 'col-md-4' );
    nameField.textContent = name;

    return nameField;
};

function createPriceField( price ) {

    const priceField = document.createElement( 'DIV' );
    priceField.classList.add( 'col-md-3' );
    priceField.textContent = `$${ price }`;

    return priceField;
};

function createCategoryField( category ) {
    const categoryField = document.createElement( 'DIV' );
    categoryField.classList.add( 'col-md-3', 'fw-bold' );
    categoryField.textContent = categories[ category ];

    return categoryField;
};

function createDivCantidad( product ) {

    const inputCantidad = document.createElement( 'INPUT' );
    inputCantidad.type = 'number';
    inputCantidad.min = '0';
    inputCantidad.value = 0;
    inputCantidad.id = `product-${ product.id }`;
    inputCantidad.classList.add( 'form-control' );

    //para identificar platillo y cantidad
    inputCantidad.onchange = function () {
        const quantity = parseInt( inputCantidad.value );
        getSaucer( { ...product, quantity } )
    };

    const divCantidad = document.createElement( 'DIV' );
    divCantidad.classList.add( 'col-md-2' );
    divCantidad.appendChild( inputCantidad );

    return divCantidad;
}

function getSaucer( product ) {

    let { order } = customer;

    //para validar que la cantidad sea mayor a 0
    if ( product.quantity > 0 ) {
        //para determinar si el articulo existe, actualizar cantidad
        if ( order.some( article => article.id === product.id ) ) {

            const updatedOrder = order.map( article => {

                if ( article.id === product.id ) {
                    article.quantity = product.quantity
                }

                return article;
            } );

            customer.order = [ ...updatedOrder ];
        } else {

            customer.order = [ ...order, product ];
        }

    } else {
        if ( product.quantity === 0 ) {

            customer.order = customer.order.filter( article => article.id !== product.id );
        }
    }

    cleanHTML();

    if ( customer.order.length ) {
        updateSumary();
        return;
    }
    emptyOrderMessage();

    //To reset the quantity of list

    resetQuantityOfElement( product.id );

}

function updateSumary() {

    const content = document.querySelector( '#sumary .content' );

    const sumary = document.createElement( 'DIV' );
    sumary.classList.add( 'col-md-6', 'card', 'py-5', 'px-3', 'shadow' );

    //table info
    const table = createTable();
    //time info
    const time = createTime();
    //title of section
    const heading = createHeading();
    //Sumary info
    const group = createGroup();

    sumary.appendChild( heading );
    sumary.appendChild( table );
    sumary.appendChild( time );
    sumary.appendChild( group );

    content.appendChild( sumary );

    //to show tips section
    showTipsForm();
}

function createTable() {
    const table = document.createElement( 'P' );
    table.textContent = 'Table: ';
    table.classList.add( 'fw-bold' );

    const tableSpan = document.createElement( 'SPAN' );
    tableSpan.textContent = customer.table;
    tableSpan.classList.add( 'fw-normal' );

    table.appendChild( tableSpan );
    return table;

};

function createTime() {
    const time = document.createElement( 'P' );
    time.textContent = 'Time: ';
    time.classList.add( 'fw-bold' );

    const timeSpan = document.createElement( 'SPAN' );
    timeSpan.textContent = `${ customer.time }hrs`;
    timeSpan.classList.add( 'fw-normal' );


    time.appendChild( timeSpan );
    return time;
};

function createHeading() {
    const heading = document.createElement( 'H3' );
    heading.textContent = 'Ordered Saucers'
    heading.classList.add( 'my-4', 'text-center' );

    return heading;

};

function createGroup() {
    //iterate array of orders
    const group = document.createElement( 'UL' );

    group.classList.add( 'list-group' );

    const { order } = customer;
    order.forEach( article => {
        const { name, price, quantity, id } = article;

        const list = document.createElement( 'LI' );
        list.classList.add( 'list-group-item' );

        const nameElement = document.createElement( 'H4' );
        nameElement.classList.add( 'my-4' );
        nameElement.textContent = name;

        //quantity of article
        const quantityDiv = document.createElement( 'DIV' );
        quantityDiv.classList.add( 'row' )
        const quantityElement = document.createElement( 'P' );
        quantityElement.classList.add( 'col-md-6', 'fw-bold' );
        quantityElement.textContent = 'Quantity: ';

        let quantityValue = document.createElement( 'INPUT' );
        quantityValue.type = 'number';
        quantityValue.min = '0';
        quantityValue.max = `${ quantity }`;
        quantityValue.value = quantity;
        quantityValue.classList.add( 'col-md-6', 'form-control', 'fw-normal' );

        quantityValue.onchange = function () {
            let quantity = quantityValue.value;
            article.quantity = quantityValue.value;
            if ( quantity == 0 ) {
                deleteOrder( id );
                return;
            };
            getSaucer( article );
        }
        //Adding values to its containers
        quantityDiv.appendChild( quantityElement )
        quantityElement.appendChild( quantityValue );

        //price of article
        const priceElement = document.createElement( 'P' );
        priceElement.classList.add( 'fw-bold' );
        priceElement.textContent = 'Price: ';

        const priceValue = document.createElement( 'P' );
        priceValue.classList.add( 'fw-normal' );
        priceValue.textContent = `$${ price }`;

        //Adding values to its containers
        priceElement.appendChild( priceValue );

        //price of article
        const subtotalElement = createSubTotal( id, price, quantityValue.value );


        //delete button
        const btnDelete = document.createElement( 'BUTTON' );
        btnDelete.classList.add( 'btn', 'btn-danger' );
        btnDelete.textContent = 'Delete Order'.toUpperCase();

        btnDelete.onclick = function () {
            deleteOrder( id );
        }


        //para agregar elementos al LI
        list.appendChild( nameElement );
        list.appendChild( quantityDiv );
        list.appendChild( priceElement );
        list.appendChild( subtotalElement );
        list.appendChild( btnDelete );

        //para agregar lalista al grupo UL
        group.appendChild( list );
    } );
    return group;
};

function createSubTotal( id, price, quantityValue ) {

    const subtotalElement = document.createElement( 'P' );
    subtotalElement.classList.add( 'fw-bold' );
    subtotalElement.textContent = 'SubTotal: ';

    const subtotalValue = document.createElement( 'P' );
    subtotalValue.classList.add( 'fw-normal' );
    let subtotal = calculateSubtotal( id, price, quantityValue );
    subtotalValue.textContent = `$${ subtotal }`;

    subtotalElement.appendChild( subtotalValue );

    return subtotalElement;
}

function calculateSubtotal( id, price, quantity ) {

    const result = `${ price } x ${ quantity }= $${ ( price * quantity ) }`;
    if ( customer.order.some( item => item.id === id ) ) {
        cleanHTML();

    };
    return result;
};

function deleteOrder( id ) {

    const { order } = customer;
    const result = order.filter( item => item.id !== id );
    customer.order = [ ...result ];

    cleanHTML();

    if ( customer.order.length ) {
        updateSumary();
        resetQuantityOfElement( id );
        return;
    }
    emptyOrderMessage();
    resetQuantityOfElement( id );

};

function emptyOrderMessage() {
    const content = document.querySelector( '#sumary .content' );
    const text = document.createElement( 'P' );
    text.classList.add( 'text-center' );
    text.textContent = 'Add the order elements';

    content.appendChild( text );
}

function resetQuantityOfElement( id ) {
    const deletedProduct = `#product-${ id }`;
    console.log( deletedProduct );
    const quantityProduct = document.querySelector( deletedProduct );
    console.log( quantityProduct );
    quantityProduct.value = 0;
};


function showTipsForm() {

    const content = document.querySelector( '#sumary .content' )

    const form = document.createElement( 'DIV' );
    form.classList.add( 'col-md-6', 'formTips' );

    const divForm = document.createElement( 'DIV' );
    divForm.classList.add( 'card', 'py-5', 'px-3', 'shadow' );


    const heading = document.createElement( 'H3' );
    heading.classList.add( 'my-4', 'text-center' );
    heading.textContent = 'Tip'

    //Create radio button 10%
    const radio10 = document.createElement( 'INPUT' );
    radio10.type = 'radio';
    radio10.name = 'tip';
    radio10.value = '10';
    radio10.classList.add( 'form-check-input' );

    const radio10Label = document.createElement( 'Label' );
    radio10Label.textContent = '10%';
    radio10Label.classList.add( 'form-check-label' );

    const radio10Div = document.createElement( 'DIV' );
    radio10Div.classList.add( 'form-check' );
    radio10.checked = true;

    radio10Div.appendChild( radio10 );
    radio10Div.appendChild( radio10Label );


    //Create radio button 25%
    const radio25 = document.createElement( 'INPUT' );
    radio25.type = 'radio';
    radio25.name = 'tip';
    radio25.value = '25';
    radio25.classList.add( 'form-check-input' );

    const radio25Label = document.createElement( 'Label' );
    radio25Label.textContent = '25%';
    radio25Label.classList.add( 'form-check-label' );

    const radio25Div = document.createElement( 'DIV' );
    radio25Div.classList.add( 'form-check' );

    radio25Div.appendChild( radio25 );
    radio25Div.appendChild( radio25Label );

    //Create radio button 50%
    const radio50 = document.createElement( 'INPUT' );
    radio50.type = 'radio';
    radio50.name = 'tip';
    radio50.value = '50';
    radio50.classList.add( 'form-check-input' );

    const radio50Label = document.createElement( 'Label' );
    radio50Label.textContent = '50%';
    radio50Label.classList.add( 'form-check-label' );

    const radio50Div = document.createElement( 'DIV' );
    radio50Div.classList.add( 'form-check' );

    radio50Div.appendChild( radio50 );
    radio50Div.appendChild( radio50Label );

    radio10.onclick = calculateTip;
    radio25.onclick = calculateTip;
    radio50.onclick = calculateTip;

    divForm.appendChild( heading );
    divForm.appendChild( radio10Div );
    divForm.appendChild( radio25Div );
    divForm.appendChild( radio50Div );


    form.appendChild( divForm );

    content.appendChild( form );
    calculateTip();
}

function calculateTip() {

    const { order } = customer;
    let subtotal = 0;

    //to calculate subtotal
    order.forEach( article => {
        subtotal += article.quantity * article.price;
    } );

    //to select the tip that is marked
    const selectedTip = document.querySelector( '[name="tip"]:checked' ).value;

    //Calculate total
    const tip = ( ( subtotal * parseInt( selectedTip ) ) / 100 );
    const total = tip + subtotal;

    showTotalHTML( subtotal, tip, total );
}

function showTotalHTML( subtotal, tip, total ) {

    const divTotals = document.createElement( 'DIV' );
    divTotals.classList.add( 'total-Pay', 'my-5', 'border-top' );

    const subtotalParaph = document.createElement( 'P' );
    subtotalParaph.classList.add( 'fs-3', 'fw-bold', 'mt-2' );
    subtotalParaph.textContent = `Subtotal: `;

    const subtotalSpan = document.createElement( 'SPAN' );
    subtotalSpan.classList.add( 'fw-normal' );
    subtotalSpan.textContent = `$${ subtotal }`;

    const tipParaph = document.createElement( 'P' );
    tipParaph.classList.add( 'fs-3', 'fw-bold', 'mt-2' );
    tipParaph.textContent = `Tip: `;

    const tipSpan = document.createElement( 'SPAN' );
    tipSpan.classList.add( 'fw-normal' );
    tipSpan.textContent = `$${ tip }`;

    const totalParaph = document.createElement( 'P' );
    totalParaph.classList.add( 'fs-3', 'fw-bold', 'mt-2' );
    totalParaph.textContent = `Total: `;

    const totalSpan = document.createElement( 'SPAN' );
    totalSpan.classList.add( 'fw-normal' );
    totalSpan.textContent = `$${ total }`;


    subtotalParaph.appendChild( subtotalSpan );
    tipParaph.appendChild( tipSpan );
    totalParaph.appendChild( totalSpan );

    const totalPayDiv = document.querySelector( '.total-Pay' );
    if ( totalPayDiv ) {
        totalPayDiv.remove();
    }

    divTotals.appendChild( subtotalParaph );
    divTotals.appendChild( tipParaph );
    divTotals.appendChild( totalParaph );


    const form = document.querySelector( '.formTips > div' );
    form.appendChild( divTotals );
};


//Usefull Functions
function showAlert( message ) {
    const alertExist = document.querySelector( '.invalid-feedback' );
    if ( !alertExist ) {
        const alert = document.createElement( 'DIV' );
        alert.classList.add( 'invalid-feedback', 'd-block', 'text-center' )
        alert.textContent = message;
        form.appendChild( alert );
        //To remove the alert
        setTimeout( () => {
            alert.remove();
        }, 3000 );
    }
};



function cleanHTML() {
    const contenido = document.querySelector( '#sumary .content' );

    while ( contenido.firstChild ) {
        contenido.removeChild( contenido.firstChild );
    }
}