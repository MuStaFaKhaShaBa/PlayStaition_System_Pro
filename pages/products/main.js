let activepage = document.querySelector(".navbar-nav .active");

activepage.addEventListener("click", (e) => {
    e.preventDefault();
})

let add = document.querySelector(".add");
let allProductsTable = document.querySelector(".all-product") ;
let Products = [];

class DrinksTemp {
    constructor(name,buyPrice) {
        this.name = name;
        this.price = buyPrice;
    }
}

function setToLocal() {
    window.localStorage.setItem("Products", JSON.stringify(Products));
}
function getFromLocal() {
    Products = JSON.parse(window.localStorage.getItem("Products")) || [];
    createProducts(); // Call function to create Products if found
}
getFromLocal(); 
// Call immediately

add.addEventListener("click", () => {
    new Promise((resolved) => {
        resolved(Swal.fire({
            title: 'اضافة منتج',
            html: `
                    <input type="text" class="name select-device w-100 mb-3 px-3 py-1" placeholder="اسم المنتج">
        
                    <input type="number" class="price select-time w-100 mb-3 px-3 py-1" placeholder="سعر المنتج">
            `,
            allowOutsideClick: false,
            showDenyButton: true,
            denyButtonText: 'الغاء',
            confirmButtonText: 'اضافة',
            focusConfirm: false,
            preConfirm: () => {
                return [
                    document.querySelector(".name").value,
                    document.querySelector(".price").value,
                ]
            }
        })
        )
    }).then(({ isConfirmed, value: v }) => {
        if (isConfirmed) {
            if (v.indexOf('') != -1) {
                Swal.fire('تأكد من ادخال كل البيانات')
            }
            else {
                let x = new DrinksTemp(v[0], v[1]);

                Products.push(x);

                setToLocal();
                createProducts();
            }
        }
    })
});

function createProducts() {
    allProductsTable.innerHTML = `
    <div class="head border-bottom pb-2 d-flex justify-content-around align-items-center">
        <section>حذف</section>
        <section>اسم المنتج</section>
        <section>سعر البيع</section>
    </div>
    `;

    Products.forEach(({ name,price },index) => {
        let temp = `
        <div class="head d-flex justify-content-around align-items-center">
            <section>
                <button class="btn py-sm-1 px-sm-2 delete" title=" delete device" onclick="deleteDevice(${index})">حذف</button>
            </section>
            <section>
                ${name}
            </section>
            <section>
                ${price} ج
            </section>
        </div>        
        `
        allProductsTable.innerHTML += temp;
    });
}

function deleteDevice(index){
    Products.splice(index,1);
    setToLocal();
    createProducts();
}