let activepage = document.querySelector(".navbar-nav .active");

activepage.addEventListener("click", (e) => {
    e.preventDefault();
})

let add = document.querySelector(".add");
let allDevicesTable = document.querySelector(".all-device") ;
let Devices = [];

class DeviceTemp {
    constructor(name, singleSalary, multiSalary) {
        this.name = name;
        this.singleSalary = singleSalary;
        this.multiSalary = multiSalary;
    }
}

function setToLocal() {
    window.localStorage.setItem("devices", JSON.stringify(Devices));
}
function getFromLocal() {
    Devices = JSON.parse(window.localStorage.getItem("devices")) || [];
    createDevices(); // Call function to create devices if found
}
getFromLocal(); 
// Call immediately

add.addEventListener("click", () => {
    new Promise((resolved) => {
        resolved(Swal.fire({
            title: 'اضافة جهاز',
            html: `
                    <input type="text" class="name select-device w-100 mb-3 px-3 py-1" placeholder="اسم الجهاز">
        
                    <input type="number" class="single select-time w-100 mb-3 px-3 py-1" placeholder="سعر الفردي">
        
                    <input type="number" class="multi select-type  w-100 px-3 py-1" placeholder="سعر الزوجي">
                `,
            allowOutsideClick: false,
            showDenyButton: true,
            denyButtonText: 'الغاء',
            confirmButtonText: 'اضافة',
            focusConfirm: false,
            preConfirm: () => {
                return [
                    document.querySelector(".name").value,
                    document.querySelector(".single").value,
                    document.querySelector(".multi").value,
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
                // console.log(v[0], v[1], v[2]);
                let x = new DeviceTemp(v[0], v[1], v[2]);

                Devices.push(x);

                setToLocal();
                createDevices();
            }
        }
    })
});

function createDevices() {
    allDevicesTable.innerHTML = `
    <div class="head border-bottom pb-2 d-flex justify-content-around align-items-center">
        <section>حذف</section>
        <section>اسم الجهاز</section>
        <section>سعر الفردي</section>
        <section>سعر الزوجي</section>
    </div>
    `;

    Devices.forEach(({ name, multiSalary, singleSalary },index) => {
        let temp = `
        <div class="head d-flex justify-content-around align-items-center">
            <section>
                <button class="btn py-sm-1 px-sm-2 delete" title=" delete device" onclick="deleteDevice(${index})">حذف</button>
            </section>
            <section>
                ${name}
            </section>
            <section>
                ${singleSalary} ج
            </section>
            <section>
                ${multiSalary} ج
            </section>
        </div>        
        `
        allDevicesTable.innerHTML += temp;
    });
}

function deleteDevice(index){
    Devices.splice(index,1);
    setToLocal();
    createDevices();
}