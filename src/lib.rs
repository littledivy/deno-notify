mod notify;

// use deno_core and futures
use deno_core::plugin_api::Buf;
use deno_core::plugin_api::Interface;
use deno_core::plugin_api::Op;
use deno_core::plugin_api::ZeroCopyBuf;
use futures::future::FutureExt;

// use serde
use serde::Deserialize;
use serde::Serialize;

use std::path::Path;

// register all ops here
#[no_mangle]
pub fn deno_plugin_init(interface: &mut dyn Interface) {
    interface.register_op("notify", op_notify);
}


#[derive(Deserialize)]
struct NotifyParams {
    title: String,
    body: String
}

// incomplete fn to get the window name
fn op_notify(
    _interface: &mut dyn Interface,
    data: &[u8],
    zero_copy: Option<ZeroCopyBuf>,
) -> Op {
    let data_str = std::str::from_utf8(&data[..]).unwrap().to_string();
    let params: NotifyParams = serde_json::from_slice(data).unwrap();
    notify::notify(&params.title, &params.body);
    let result = b"true";
    let result_box: Buf = Box::new(*result);
    Op::Sync(result_box)
}
