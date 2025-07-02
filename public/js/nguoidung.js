let originalValues = {};
// Hàm mở modal chỉnh sửa thông tin người dùng
function editField(fieldName) {
  const displayElement = document.getElementById(`${fieldName}-display`);
  originalValues[fieldName] = displayElement.textContent;
  displayElement.style.display = 'none';
  document.getElementById(`${fieldName}-input`).style.display = 'block';
  document.getElementById(`${fieldName}-input`).value = originalValues[fieldName];
  document.getElementById(`save-${fieldName}`).style.display = 'inline-block';
  document.getElementById(`cancel-${fieldName}`).style.display = 'inline-block';
  event.target.style.display = 'none';
}
// Hàm lưu thông tin đã chỉnh sửa
function cancelEdit(fieldName) {
  document.getElementById(`${fieldName}-display`).textContent = originalValues[fieldName];
  document.getElementById(`${fieldName}-display`).style.display = 'inline';
  document.getElementById(`${fieldName}-input`).style.display = 'none';
  document.getElementById(`save-${fieldName}`).style.display = 'none';
  document.getElementById(`cancel-${fieldName}`).style.display = 'none';
  event.target.parentElement.querySelector('button:not([id^="save-"]):not([id^="cancel-"])').style.display = 'inline-block';
}

document.addEventListener("DOMContentLoaded", () => {
  loadUserInfo();
  document.getElementById("change-password")?.addEventListener("click", handleChangePassword);
});
// Hàm load thông tin người dùng
async function loadUserInfo() {
  try {
    const response = await fetch("/api/user/info", { credentials: "include" });
    if (!response.ok) throw new Error("Không thể lấy thông tin người dùng");
    const user = await response.json();
    document.getElementById("username-display").textContent = user.username;
    document.getElementById("email-display").textContent = user.email;
    document.getElementById("username-input").value = user.username;
    document.getElementById("email-input").value = user.email;
  } catch (err) {
    console.error(err);
    alert("Lỗi khi tải thông tin người dùng");
  }
}
// Hàm lưu thông tin người dùng
async function saveField(field) {
  const input = document.getElementById(`${field}-input`);
  const value = input.value.trim();
  if (!value) {
    Swal.fire({
      icon: 'warning',
      title: '⚠️ Thiếu thông tin',
      text: `Vui lòng nhập ${field === 'username' ? 'tên người dùng' : 'email'}`
    });
    return;
  }
  try {
    const response = await fetch("/api/user/update", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [field]: value })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || `Lỗi server (mã ${response.status})`);
    }
    Swal.fire({
      icon: 'success',
      title: '✅ Cập nhật thành công!',
      timer: 1500,
      showConfirmButton: false
    }).then(() => {
      location.reload();
    });
  } catch (err) {
    Swal.fire({
      icon: 'error',
      title: '❌ Lỗi',
      text: err.message || 'Không thể cập nhật thông tin.'
    });
    input.focus();
  }
}





// Hàm xử lý sự kiện khi người dùng đổi mật khẩu
async function handleChangePassword() {
  try {
    const oldPassword = await showPasswordForm("Nhập mật khẩu cũ:");
    if (!oldPassword) return;

    const newPassword = await showPasswordForm("Nhập mật khẩu mới:");
    if (!newPassword) return;
    const response = await fetch("/api/user/password", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ oldPassword, newPassword })
    });

   const data = await response.json();

  if (!response.ok) {
    Swal.fire({
      icon: 'error',
      title: '❌ Đổi mật khẩu thất bại',
      text: data.message || 'Có lỗi xảy ra khi đổi mật khẩu. Vui lòng thử lại.'
    });
    return;
  }

  Swal.fire({
    icon: 'success',
    title: '✅ Đổi mật khẩu thành công!',
    text: data.message || 'Bạn có thể sử dụng mật khẩu mới ngay bây giờ.',
    timer: 2000,
    showConfirmButton: false
  });
  
} catch (err) {
  console.error("Lỗi đổi mật khẩu:", err);

  Swal.fire({
    icon: 'error',
    title: '🚫 Lỗi hệ thống',
    text: err.message || 'Không thể kết nối đến máy chủ.'
  });
}
}

// Hàm hiển thị form nhập mật khẩu
function showPasswordForm(title) {
  return new Promise((resolve) => {
    if (document.querySelector(".password-form")) return;

    const form = document.createElement("div");
    form.className = "password-form";
    form.innerHTML = `
      <label>${title}</label>
      <input type="password">
      <button type="button">Xác nhận</button>
      <button type="button">Hủy</button>
    `;

    document.body.appendChild(form);
    const [input, confirmBtn, cancelBtn] = form.querySelectorAll("input, button");

    confirmBtn.onclick = () => {
      if (input.value.trim()) {
        document.body.removeChild(form);
        resolve(input.value.trim());
      }
    };

    cancelBtn.onclick = () => {
      document.body.removeChild(form);
      resolve(null);
    };
  });
}


  const user = JSON.parse(localStorage.getItem('user')); // Lấy từ localStorage khi login
  const token = localStorage.getItem('token'); // nếu dùng JWT thì thêm Authorization

  function fetchBalance() {
    fetch('/api/coin/balance', {
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include' // Nếu dùng session (quan trọng!)
    })
    .then(res => res.json())
    .then(data => {
      document.getElementById('teacoin-balance').innerText = data.balance + ' coin';
    })
    .catch(err => {
      document.getElementById('teacoin-balance').innerText = 'Lỗi tải dữ liệu';
    });
  }

  function buyVoucher() {
    const coinAmount = parseInt(document.getElementById('coinAmount').value);
    if (!coinAmount || coinAmount <= 0) {
      alert('Nhập số coin hợp lệ');
      return;
    }

    fetch('/api/coin/buy-voucher', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({ coinAmount })
    })
    .then(res => res.json())
    .then(data => {
      if (data.error) {
        document.getElementById('voucher-result').innerText = data.error;
      } else {
        document.getElementById('voucher-result').innerHTML = `
          🎉 Đổi voucher thành công! <br>
          <strong>Mã:</strong> ${data.voucher.code} <br>
          <strong>Giảm:</strong> ${data.voucher.discount}đ <br>
          <strong>HSD:</strong> ${data.voucher.expiresAt}
        `;
        fetchBalance(); // cập nhật lại số dư
      }
    })
    .catch(err => {
      document.getElementById('voucher-result').innerText = 'Có lỗi xảy ra';
    });
  }

  fetchBalance();
   function loadBalance() {
    fetch('/api/coin/balance', {
      credentials: 'include'
    })
    .then(res => res.json())
    .then(data => {
      document.getElementById('coinBalance').innerText = data.balance + ' coin';
    })
    .catch(() => {
      document.getElementById('coinBalance').innerText = 'Không tải được 😢';
    });
  }

  function claimDailyLogin() {
    fetch('/api/coin/daily-login', {
      method: 'POST',
      credentials: 'include'
    })
    .then(res => res.json())
    .then(data => {
      const msgBox = document.getElementById('dailyLoginMessage');
      if (data.error) {
        msgBox.style.color = 'red';
        msgBox.innerText = '❌ ' + data.error;
      } else {
        msgBox.style.color = 'green';
        msgBox.innerText = '✅ ' + data.message;
        loadBalance(); // Cập nhật lại số dư
      }
    })
    .catch(() => {
      document.getElementById('dailyLoginMessage').innerText = 'Đã có lỗi xảy ra 😢';
    });
  }
  
  function toggleHamburger() {
  const nav = document.getElementById('mainNav');
  const icon = document.querySelector('.hamburger');
  nav.classList.toggle('active');
  icon.textContent = nav.classList.contains('active') ? '✖' : '☰';
}
  // Tải số dư khi vào trang
  loadBalance();


